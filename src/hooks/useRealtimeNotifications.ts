import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: "ticket" | "invoice";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const useRealtimeNotifications = (isAdmin: boolean = false) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushEnabled, setPushEnabled] = useState(true);
  const { toast } = useToast();

  // Fetch user's notification preference
  useEffect(() => {
    const fetchPreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("notification_push_enabled")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setPushEnabled(profile.notification_push_enabled ?? true);
      }
    };
    fetchPreference();
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
    
    // Only show toast if push notifications are enabled
    if (pushEnabled) {
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  }, [toast, pushEnabled]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const ticketFilter = isAdmin ? {} : { filter: `user_id=eq.${session.user.id}` };
      const invoiceFilter = isAdmin ? {} : { filter: `user_id=eq.${session.user.id}` };

      const channel = supabase
        .channel("realtime-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_tickets",
            ...ticketFilter,
          },
          (payload) => {
            const ticket = payload.new as { subject: string; status: string };
            addNotification({
              type: "ticket",
              title: isAdmin ? "New Support Ticket" : "Ticket Created",
              message: `${ticket.subject}`,
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "support_tickets",
            ...ticketFilter,
          },
          (payload) => {
            const ticket = payload.new as { subject: string; status: string };
            addNotification({
              type: "ticket",
              title: "Ticket Updated",
              message: `Status changed to ${ticket.status}: ${ticket.subject}`,
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "invoices",
            ...invoiceFilter,
          },
          (payload) => {
            const invoice = payload.new as { invoice_number: string; amount: number };
            addNotification({
              type: "invoice",
              title: "New Invoice",
              message: `Invoice #${invoice.invoice_number} - $${invoice.amount}`,
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "invoices",
            ...invoiceFilter,
          },
          (payload) => {
            const invoice = payload.new as { invoice_number: string; status: string };
            addNotification({
              type: "invoice",
              title: "Invoice Updated",
              message: `Invoice #${invoice.invoice_number} is now ${invoice.status}`,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [isAdmin, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};
