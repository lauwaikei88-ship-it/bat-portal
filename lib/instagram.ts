const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

/**
 * Post to Instagram via Meta Graph API.
 * Supports FEED (Image/Video), STORY (Image/Video), and CAROUSEL (Multiple Images/Videos).
 */
export async function postToInstagram(
  mediaUrls: string[], 
  caption: string, 
  accessToken: string, 
  igAccountId: string, 
  formatType: 'FEED' | 'STORY' | 'CAROUSEL' = 'FEED'
): Promise<string> {
  
  if (mediaUrls.length === 0) throw new Error('No media URLs provided');

  // Helper to create a single media container
  const createContainer = async (url: string, isCarouselItem: boolean, isStory: boolean, isVideo: boolean) => {
    const params: any = { access_token: accessToken };
    
    if (isVideo) {
      params.video_url = url;
      params.media_type = isStory ? 'STORIES' : 'REELS';
    } else {
      params.image_url = url;
      if (isStory) params.media_type = 'STORIES';
    }

    if (isCarouselItem) {
      params.is_carousel_item = 'true';
    } else if (!isStory) {
      // Stories don't use captions in the container
      params.caption = caption;
    }

    const res = await fetch(`${META_GRAPH_URL}/${igAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });
    const data = await res.json();
    if (!data?.id) throw new Error(`Failed to create container: ${JSON.stringify(data)}`);
    return data.id;
  };

  // Helper to wait for a container to be ready
  const waitForContainer = async (containerId: string) => {
    for (let attempt = 0; attempt < 24; attempt++) {
      const res = await fetch(`${META_GRAPH_URL}/${containerId}?fields=status_code&access_token=${accessToken}`);
      const data = await res.json();
      const status = (data?.status_code ?? '').toUpperCase();
      
      if (status === 'FINISHED') return;
      if (status === 'ERROR') throw new Error(`Media rejected: ${JSON.stringify(data)}`);
      
      await new Promise(r => setTimeout(r, 5000));
    }
    throw new Error('Timeout waiting for media container to finish processing');
  };

  // 1. CAROUSEL Logic
  if (formatType === 'CAROUSEL' && mediaUrls.length > 1) {
    const childContainerIds = [];
    // Create children containers
    for (const url of mediaUrls) {
      const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.mov');
      const childId = await createContainer(url, true, false, isVideo);
      childContainerIds.push(childId);
    }

    // Wait for all children to be ready (important for videos in carousels)
    for (const childId of childContainerIds) {
      await waitForContainer(childId);
    }

    // Create Carousel Container
    const carouselParams = {
      media_type: 'CAROUSEL',
      children: childContainerIds.join(','),
      caption: caption,
      access_token: accessToken,
    };
    
    const carouselRes = await fetch(`${META_GRAPH_URL}/${igAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(carouselParams),
    });
    const carouselData = await carouselRes.json();
    if (!carouselData?.id) throw new Error(`Failed to create carousel: ${JSON.stringify(carouselData)}`);
    
    const carouselId = carouselData.id;
    await waitForContainer(carouselId);

    // Publish Carousel
    const publishRes = await fetch(`${META_GRAPH_URL}/${igAccountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ creation_id: carouselId, access_token: accessToken }),
    });
    const publishData = await publishRes.json();
    if (!publishData?.id) throw new Error(`Failed to publish carousel: ${JSON.stringify(publishData)}`);
    return publishData.id;
  }

  // 2. Single FEED or STORY Logic
  const url = mediaUrls[0];
  const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.mov');
  const isStory = formatType === 'STORY';
  
  const creationId = await createContainer(url, false, isStory, isVideo);
  await waitForContainer(creationId);

  // Publish
  const publishRes = await fetch(`${META_GRAPH_URL}/${igAccountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ creation_id: creationId, access_token: accessToken }),
  });
  const publishData = await publishRes.json();
  if (!publishData?.id) throw new Error(`Failed to publish single media: ${JSON.stringify(publishData)}`);
  
  return publishData.id;
}

/**
 * Post an image + caption to a Facebook Page via Meta Graph API.
 * Currently supports single image/video for Facebook. (Extendable to Carousel/Reels if needed)
 */
export async function postToFacebookPage(
  mediaUrls: string[], 
  caption: string, 
  accessToken: string, 
  fbPageId: string,
  formatType: 'FEED' | 'STORY' | 'CAROUSEL' = 'FEED'
): Promise<string> {
  const url = mediaUrls[0];
  const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.mov');

  if (isVideo) {
    const videoParams: any = {
      description: caption,
      file_url: url,
      access_token: accessToken,
    };
    
    // Facebook has a different endpoint for videos
    const publishRes = await fetch(`${META_GRAPH_URL}/${fbPageId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(videoParams),
    });
    const publishData = await publishRes.json();
    if (!publishData?.id) throw new Error(`Failed to publish Facebook video: ${JSON.stringify(publishData)}`);
    return publishData.id;
  }

  const bodyParams: any = {
    message: caption,
    url: url,
    published: 'true',
    access_token: accessToken,
  };

  const publishRes = await fetch(`${META_GRAPH_URL}/${fbPageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(bodyParams),
  });

  const publishData = await publishRes.json();
  const postId = publishData?.id || publishData?.post_id;
  
  if (!postId) {
    throw new Error(`Failed to publish to Facebook Page: ${JSON.stringify(publishData)}`);
  }

  return postId;
}
