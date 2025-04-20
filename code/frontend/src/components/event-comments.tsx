import { useState, useEffect } from "react";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Reply, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface Reply {
  _id: string;
  userId: string;
  text: string;
  createdAt: string;
  userName: string;
}

interface Comment {
  _id: string;
  userId: string;
  text: string;
  createdAt: string;
  userName: string;
  replies: Reply[];
}

interface EventCommentsProps {
  eventId: string;
}

export default function EventComments({ eventId }: EventCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState<string | null>(null);

  // Fetch comments when component mounts or eventId changes
  useEffect(() => {
    if (!eventId) return;
    fetchComments();
  }, [eventId]);

  // Function to get user initials for avatar
  const getInitials = (name: string) => {

    if (!name || name === "undefined") return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get display name with fallback
  const getDisplayName = (userName: string) => {
    return userName && userName !== "undefined" ? userName : "Anonymous User";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Unknown date";
    }
  };

  // Fetch comments from the API
  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/comments`,
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      // Add the new comment to the list
      if (response.data && response.data.comment) {
        setComments(prev => [...prev, response.data.comment]);
      }
      
      // Clear the input
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // Add a reply to a comment
  const handleAddReply = async (commentId: string) => {
    const replyContent = replyText[commentId];
    if (!replyContent || !replyContent.trim()) return;
    
    setReplyLoading(commentId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/comments/${commentId}/replies`,
        { text: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      // Update the comments list with the new reply
      if (response.data && response.data.reply) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === commentId 
              ? { 
                  ...comment, 
                  replies: [...comment.replies, response.data.reply] 
                } 
              : comment
          )
        );
      }
      
      // Clear the reply input and close the reply form
      setReplyText(prev => ({ ...prev, [commentId]: "" }));
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setReplyLoading(null);
    }
  };

  // Toggle the reply form for a comment
  const toggleReplyForm = (commentId: string) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
    } else {
      setReplyingTo(commentId);
      // Initialize empty reply text if not already set
      if (!replyText[commentId]) {
        setReplyText(prev => ({ ...prev, [commentId]: "" }));
      }
    }
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading comments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-medium">Comments</h3>
      </div>

      {/* Comment input form */}
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea 
            placeholder="Add a comment..." 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] w-full"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddComment} 
              disabled={commentLoading || !newComment.trim()}
              size="sm"
            >
              {commentLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment._id} className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{getDisplayName(comment.userName)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                  
                  {/* Reply button */}
                  <div className="flex items-center pt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => toggleReplyForm(comment._id)}
                    >
                      <Reply className="h-3.5 w-3.5 mr-1" />
                      {replyingTo === comment._id ? "Cancel" : "Reply"}
                    </Button>
                  </div>
                  
                  {/* Reply form */}
                  {replyingTo === comment._id && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyText[comment._id] || ""}
                        onChange={(e) => 
                          setReplyText(prev => ({ 
                            ...prev, 
                            [comment._id]: e.target.value 
                          }))
                        }
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleAddReply(comment._id)}
                          disabled={replyLoading === comment._id || !replyText[comment._id]?.trim()}
                        >
                          {replyLoading === comment._id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5 mr-1.5" />
                              Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Replies list */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-muted space-y-3">
                      {comment.replies.map((reply, index) => (
                        <div key={reply._id || index} className="flex gap-2">
                          <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarFallback>{getInitials(reply.userName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-xs">{getDisplayName(reply.userName)}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(reply.createdAt)}
                              </div>
                            </div>
                            <p className="text-xs">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}