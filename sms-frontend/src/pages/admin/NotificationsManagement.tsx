import api from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send, Bell, Users, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsManagement() {
  const { toast } = useToast();

  const [history, setHistory] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("all");

  /* ============================
     FETCH NOTIFICATION HISTORY
  ============================ */
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setHistory(res.data);
    } catch (err) {
      console.error("Fetch notifications error", err);
      toast({
        title: "Error",
        description: "Failed to load notification history",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ============================
     SEND NOTIFICATION
  ============================ */
  const sendNotification = async () => {
    if (!message) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/api/notifications", {
        message, // ONLY this is stored in DB
      });

      toast({
        title: "Notification Sent",
        description: "Your message has been sent successfully",
      });

      setTitle("");
      setMessage("");
      setRecipients("all");

      fetchNotifications();
    } catch (err) {
      console.error("Send notification error", err);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };
  const deleteNotification = async (id: number) => {
  try {
    await api.delete(`/api/notifications/${id}`);

    toast({
      title: "Deleted",
      description: "Notification removed successfully",
    });

    fetchNotifications(); 
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Failed to delete notification",
      variant: "destructive",
    });
  }
};


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        title="Notifications"
        subtitle="Send announcements and view notification history"
      />

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="create">Create Message</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ================= CREATE ================= */}
        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-6">New Notification</h3>

              <div className="space-y-6">
                <div>
                  <Label>Title (Preview only)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter notification title"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    rows={5}
                  />
                </div>

                <div>
                  <Label>Recipients (Preview only)</Label>
                  <Select value={recipients} onValueChange={setRecipients}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="teachers">Teachers Only</SelectItem>
                      <SelectItem value="parents">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={sendNotification} className="w-full">
                  <Send className="h-4 w-4 mr-2" /> Send Notification
                </Button>
              </div>
            </div>

            {/* ================= PREVIEW ================= */}
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-6">Preview</h3>

              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {title || "Notification Title"}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      {message || "Your message will appear here..."}
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <Users className="h-4 w-4" />
                      To:{" "}
                      {recipients === "all"
                        ? "Everyone"
                        : recipients.charAt(0).toUpperCase() +
                          recipients.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ================= HISTORY ================= */}
        <TabsContent value="history">
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-6">
              Notification History
            </h3>

            <div className="space-y-4">
              {history.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No notifications sent yet.
                </p>
              )}

              {history.map((notification) => (
  <div
    key={notification.id}
    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
  >
    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
      <Bell className="h-5 w-5 text-primary" />
    </div>

    <div className="flex-1">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-foreground">
          Notification
        </h4>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {new Date(notification.created_at).toLocaleString()}
          </span>

          {/* DELETE BUTTON */}
          <button
            onClick={() => {
  if (confirm("Are you sure you want to delete this notification?")) {
    deleteNotification(notification.id);
  }
}}

            className="text-destructive hover:opacity-80"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-1">
        {notification.message}
      </p>

      <span className="text-xs text-muted-foreground">
        Status: {notification.is_read ? "Read" : "Unread"}
      </span>
    </div>
  </div>
))}

            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
