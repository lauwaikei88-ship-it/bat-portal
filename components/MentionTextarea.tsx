import React, { useState, useRef, useEffect, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';

const MOCK_USERS = [
  { id: '1', username: 'instagram', name: 'Instagram' },
  { id: '2', username: 'meta', name: 'Meta' },
  { id: '3', username: 'creators', name: 'Instagram Creators' },
  { id: '4', username: 'zuck', name: 'Mark Zuckerberg' },
  { id: '5', username: 'mosseri', name: 'Adam Mosseri' },
  { id: '6', username: 'design', name: 'Instagram Design' },
];

export interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const MentionTextarea = forwardRef<HTMLTextAreaElement, MentionTextareaProps>(
  ({ value, onChange, placeholder, className, rows = 5 }, ref) => {
    const [cursorPos, setCursorPos] = useState<number>(0);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    // Parse current word before cursor
    useEffect(() => {
      const textBeforeCursor = value.slice(0, cursorPos);
      const match = textBeforeCursor.match(/@([a-zA-Z0-9_.]*)$/);
      if (match) {
        setMentionQuery(match[1]);
        setSelectedIndex(0);
      } else {
        setMentionQuery(null);
      }
    }, [value, cursorPos]);

    const filteredUsers = mentionQuery !== null
      ? MOCK_USERS.filter(u => 
          u.username.toLowerCase().includes(mentionQuery.toLowerCase()) || 
          u.name.toLowerCase().includes(mentionQuery.toLowerCase())
        )
      : [];

    const handleSelect = (username: string) => {
      if (mentionQuery === null) return;
      
      const textBeforeCursor = value.slice(0, cursorPos);
      const textAfterCursor = value.slice(cursorPos);
      
      // Find where the @ starts
      const lastAtIdx = textBeforeCursor.lastIndexOf('@');
      if (lastAtIdx !== -1) {
        const newTextBefore = value.slice(0, lastAtIdx) + `@${username} `;
        const newText = newTextBefore + textAfterCursor;
        onChange(newText);
        
        // Move cursor
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newTextBefore.length, newTextBefore.length);
            setCursorPos(newTextBefore.length);
          }
        }, 0);
      }
      
      setMentionQuery(null);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionQuery !== null && filteredUsers.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          handleSelect(filteredUsers[selectedIndex].username);
        } else if (e.key === 'Escape') {
          setMentionQuery(null);
        }
      }
    };

    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setCursorPos(e.target.selectionStart);
          }}
          onClick={(e) => setCursorPos(e.currentTarget.selectionStart)}
          onKeyUp={(e) => setCursorPos(e.currentTarget.selectionStart)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={className}
        />
        
        {mentionQuery !== null && filteredUsers.length > 0 && (
          <div className="absolute z-50 w-64 bg-white shadow-xl border border-slate-200 rounded-xl overflow-hidden mt-2 left-0 top-full">
            <div className="max-h-64 overflow-y-auto py-2">
              {filteredUsers.map((user, idx) => (
                <div
                  key={user.id}
                  onClick={() => handleSelect(user.username)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-3 ${idx === selectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800 truncate">{user.username}</div>
                    <div className="text-xs text-slate-500 truncate">{user.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MentionTextarea.displayName = 'MentionTextarea';
