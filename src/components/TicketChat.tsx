import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User, Headphones, MessageCircle, Paperclip, X, FileIcon, Image, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sendEmailNotification } from "@/lib/notifications";

type Reply = {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
};

type TicketChatProps = {
  ticketId: string;
  ticketUserId: string;
  ticketSubject: string;
  isStaff: boolean;
};

export const TicketChat = ({ ticketId, ticketUserId, ticketSubject, isStaff }: TicketChatProps) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchReplies();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`ticket-replies-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_replies',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          const newReply = payload.new as Reply;
          setReplies(prev => [...prev, newReply]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 50);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file under 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string; filePath: string } | null> => {
    if (!currentUserId) return null;
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUserId}/${ticketId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Store the file path instead of public URL (bucket is now private)
    return { url: filePath, name: file.name, filePath };
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-signed-url', {
        body: { filePath, bucket: 'ticket-attachments' }
      });
      
      if (error) {
        console.error('Error getting signed URL:', error);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error invoking get-signed-url:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !selectedFile) || !currentUserId) return;

    setSending(true);
    setUploading(!!selectedFile);
    
    try {
      let attachmentData: { url: string; name: string } | null = null;
      
      if (selectedFile) {
        attachmentData = await uploadFile(selectedFile);
      }

      const { error } = await supabase.from("ticket_replies").insert({
        ticket_id: ticketId,
        user_id: currentUserId,
        message: message.trim() || (attachmentData ? `Sent an attachment: ${attachmentData.name}` : ""),
        is_staff: isStaff,
        attachment_url: attachmentData?.url || null,
        attachment_name: attachmentData?.name || null,
      });

      if (error) throw error;

      // Send email notification to the other party
      if (isStaff) {
        sendEmailNotification("ticket_updated", ticketUserId, {
          id: ticketId,
          subject: ticketSubject,
          status: "reply_received",
        });
      }

      setMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
      toast({ title: "Message sent" });
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext && imageExtensions.includes(ext);
  };

  const AttachmentRenderer = ({ filePath, attachmentName, isStaffMessage }: { filePath: string; attachmentName: string; isStaffMessage: boolean }) => {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const isImage = isImageFile(attachmentName);
    
    useEffect(() => {
      const fetchSignedUrl = async () => {
        const url = await getSignedUrl(filePath);
        setSignedUrl(url);
        setLoading(false);
      };
      fetchSignedUrl();
    }, [filePath]);

    if (loading) {
      return (
        <div className={`mt-2 flex items-center gap-2 p-2 rounded-lg ${
          isStaffMessage ? 'bg-background/50' : 'bg-primary-foreground/10'
        }`}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading attachment...</span>
        </div>
      );
    }

    if (!signedUrl) {
      return (
        <div className={`mt-2 flex items-center gap-2 p-2 rounded-lg ${
          isStaffMessage ? 'bg-background/50' : 'bg-primary-foreground/10'
        }`}>
          <File className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs truncate max-w-[150px]">{attachmentName}</span>
        </div>
      );
    }
    
    return (
      <a
        href={signedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 flex items-center gap-2 p-2 rounded-lg transition-colors ${
          isStaffMessage 
            ? 'bg-background/50 hover:bg-background/80' 
            : 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
        }`}
      >
        {isImage ? (
          <div className="space-y-2">
            <img 
              src={signedUrl} 
              alt={attachmentName}
              className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
            />
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <Image className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{attachmentName}</span>
            </div>
          </div>
        ) : (
          <>
            <File className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs truncate max-w-[150px]">{attachmentName}</span>
          </>
        )}
      </a>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, "h:mm a");
    }
    return format(date, "MMM d, h:mm a");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-b from-muted/30 to-transparent rounded-xl">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] overflow-hidden bg-background">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Headphones className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Support Team</h3>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online • Usually replies in minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 px-5 py-5" ref={scrollRef}>
        {replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center mb-5">
              <MessageCircle className="w-9 h-9 text-muted-foreground/60" />
            </div>
            <h4 className="font-semibold text-foreground text-lg mb-2">How can we help?</h4>
            <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
              Send us a message and our support team will get back to you shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {replies.map((reply, index) => {
              const isStaffMessage = reply.is_staff;
              const showTimestamp = index === 0 || 
                new Date(reply.created_at).getTime() - new Date(replies[index - 1].created_at).getTime() > 300000;
              const showAvatar = index === 0 || replies[index - 1]?.is_staff !== reply.is_staff;
              
              return (
                <div key={reply.id} className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                  {showTimestamp && (
                    <div className="flex justify-center mb-4">
                      <span className="text-[10px] text-muted-foreground/70 bg-muted/50 px-3 py-1 rounded-full">
                        {formatMessageTime(reply.created_at)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex gap-2.5 ${isStaffMessage ? 'justify-start' : 'justify-end'}`}>
                    {/* Support Team - Left aligned */}
                    {isStaffMessage && (
                      <>
                        {showAvatar ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Headphones className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="w-8 flex-shrink-0" />
                        )}
                        <div className="max-w-[75%] group">
                          <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">{reply.message}</p>
                            {reply.attachment_url && reply.attachment_name && <AttachmentRenderer filePath={reply.attachment_url} attachmentName={reply.attachment_name} isStaffMessage={true} />}
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {format(new Date(reply.created_at), "h:mm a")}
                          </p>
                        </div>
                      </>
                    )}
                    
                    {/* Customer - Right aligned */}
                    {!isStaffMessage && (
                      <>
                        <div className="max-w-[75%] group">
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{reply.message}</p>
                            {reply.attachment_url && reply.attachment_name && <AttachmentRenderer filePath={reply.attachment_url} attachmentName={reply.attachment_name} isStaffMessage={false} />}
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 mr-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            {format(new Date(reply.created_at), "h:mm a")}
                          </p>
                        </div>
                        {showAvatar ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0 shadow-md">
                            <User className="w-3.5 h-3.5 text-accent-foreground" />
                          </div>
                        ) : (
                          <div className="w-8 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-border/30 bg-muted/20 flex-shrink-0">
        {/* Selected file preview */}
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {isImageFile(selectedFile.name) ? (
                <Image className="w-4 h-4 text-primary" />
              ) : (
                <FileIcon className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={removeSelectedFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div className="flex gap-2 items-end">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />
          
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-[46px] w-[46px] rounded-xl hover:bg-muted flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 min-h-[46px] max-h-[120px] resize-none py-3 px-4 bg-background border-border/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 rounded-xl text-sm placeholder:text-muted-foreground/60"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={(!message.trim() && !selectedFile) || sending}
            className="h-[46px] w-[46px] rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none disabled:scale-100 flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        {uploading && (
          <p className="text-xs text-muted-foreground mt-2 text-center">Uploading file...</p>
        )}
      </div>
    </div>
  );
};