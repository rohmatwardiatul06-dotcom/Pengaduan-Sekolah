import React, { useState, useEffect, useRef } from "react";
import { X, Send, User, MessageSquare } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const CommentModal = ({ complaint, onClose, onAddComment }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Parse comments safely
  let comments = [];
  if (complaint.admin_comment) {
    try {
      const parsed = JSON.parse(complaint.admin_comment);
      if (Array.isArray(parsed)) {
        comments = parsed;
      } else {
        comments = [{
          sender_role: 'admin',
          sender_name: 'Admin/Guru',
          text: complaint.admin_comment,
          created_at: complaint.updated_at
        }];
      }
    } catch (e) {
      comments = [{
        sender_role: 'admin',
        sender_name: 'Admin/Guru',
        text: complaint.admin_comment,
        created_at: complaint.updated_at
      }];
    }
  }

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSending(true);
      await onAddComment(commentText.trim());
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment in modal:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    }) + " - " + date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-violet-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Tanggapan & Diskusi Laporan</h3>
              <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">Laporan: {complaint.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-150 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Complaint Info Snippet */}
        <div className="px-6 py-3 bg-violet-50/30 border-b border-slate-100 text-xs">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="font-bold text-slate-700">Pelapor: </span>
              <span className="text-slate-600 font-medium">{complaint.username || "Siswa"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Status: </span>
              <span className="text-slate-600 font-medium capitalize">{complaint.status === "pending" ? "Tertunda" : complaint.status}</span>
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
              <MessageSquare className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2 animate-bounce" />
              <p className="text-xs font-semibold">Belum ada diskusi.</p>
              <p className="text-[10px] text-slate-400 mt-1">Silakan tulis tanggapan atau tanggapi laporan di bawah.</p>
            </div>
          ) : (
            comments.map((msg, index) => {
              const isMe = msg.sender_name === user?.username;
              const isTeacherOrAdmin = msg.sender_role === "admin" || msg.sender_role === "guru";

              return (
                <div 
                  key={index}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  {/* Sender Name */}
                  <span className="text-[10px] font-semibold text-slate-400 px-1 mb-0.5">
                    {msg.sender_name} {isTeacherOrAdmin && <span className="text-emerald-600 text-[8px] font-bold uppercase ml-1 px-1 py-0.2 bg-emerald-50 rounded">(Staf)</span>}
                  </span>

                  {/* Bubble */}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                    isMe 
                      ? "bg-violet-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`block text-[8px] mt-1.5 text-right ${
                      isMe ? "text-violet-200" : "text-slate-400 font-medium"
                    }`}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white flex gap-2 items-center">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={sending}
            placeholder="Tulis tanggapan atau komentar..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || sending}
            className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-600/10 flex items-center justify-center shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default CommentModal;
