import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (accountsError) throw accountsError;

    let totalReach = 0;
    let totalEngagement = 0;

    for (const account of accounts || []) {
      try {
        if (account.platform === 'facebook_page') {
          const res = await fetch(`https://graph.facebook.com/v21.0/${account.platform_account_id}/insights?metric=page_impressions_unique,page_post_engagements&period=days_28&access_token=${account.access_token}`);
          const data = await res.json();
          if (data.data) {
            data.data.forEach((metric: any) => {
              if (metric.name === 'page_impressions_unique' && metric.values?.length > 0) {
                totalReach += metric.values[0].value || 0;
              }
              if (metric.name === 'page_post_engagements' && metric.values?.length > 0) {
                totalEngagement += metric.values[0].value || 0;
              }
            });
          }
        } else if (account.platform === 'instagram') {
          // IG Insights - Reach
          const res = await fetch(`https://graph.facebook.com/v21.0/${account.platform_account_id}/insights?metric=reach&period=days_28&access_token=${account.access_token}`);
          const data = await res.json();
          if (data.data) {
            data.data.forEach((metric: any) => {
              if (metric.name === 'reach' && metric.values?.length > 0) {
                totalReach += metric.values[0].value || 0;
              }
            });
          }

          // IG Insights - Interactions (Engagement)
          const intRes = await fetch(`https://graph.facebook.com/v21.0/${account.platform_account_id}/insights?metric=total_interactions&metric_type=total_value&period=day&access_token=${account.access_token}`);
          const intData = await intRes.json();
          if (intData.data) {
            intData.data.forEach((metric: any) => {
              if (metric.name === 'total_interactions' && metric.total_value?.value !== undefined) {
                totalEngagement += metric.total_value.value;
              }
            });
          }
        }
      } catch (err) {
        console.error(`Failed to fetch analytics for account ${account.id}:`, err);
      }
    }

    let engagementRate = 0;
    if (totalReach > 0) {
      engagementRate = (totalEngagement / totalReach) * 100;
    }

    return NextResponse.json({
      reach: totalReach,
      engagement: totalEngagement,
      engagementRate: engagementRate.toFixed(2)
    });
  } catch (error: any) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
