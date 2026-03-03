import { supabase } from "@/integrations/supabase/client";

type NotificationType = "ticket_created" | "ticket_updated" | "invoice_created" | "invoice_updated";

export const sendEmailNotification = async (
  type: NotificationType,
  userId: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: response, error } = await supabase.functions.invoke("send-notification", {
      body: { type, userId, data },
    });

    if (error) {
      console.error("Failed to send notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return { success: false, error: error.message };
  }
};
