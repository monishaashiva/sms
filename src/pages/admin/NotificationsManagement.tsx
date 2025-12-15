import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send, Bell, Users, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notifications } from '@/data/dummyData';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsManagement() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('all');

  const sendNotification = () => {
    if (!title || !message) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Notification Sent',
      description: `Your message has been sent to ${recipients === 'all' ? 'everyone' : recipients}.`,
    });

    setTitle('');
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Notifications"
        subtitle="Send announcements and view notification history"
      />

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="create">Create Message</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Form */}
            <div className="form-section">
              <h3 className="text-lg font-semibold text-foreground mb-6">New Notification</h3>
              <div className="space-y-6">
                <div className="input-group">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter notification title"
                  />
                </div>
                <div className="input-group">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    rows={5}
                  />
                </div>
                <div className="input-group">
                  <Label>Recipients</Label>
                  <Select value={recipients} onValueChange={setRecipients}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
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

            {/* Preview */}
            <div className="form-section">
              <h3 className="text-lg font-semibold text-foreground mb-6">Preview</h3>
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{title || 'Notification Title'}</h4>
                    <p className="text-sm text-muted-foreground mt-2">{message || 'Your message will appear here...'}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        To: {recipients === 'all' ? 'Everyone' : recipients.charAt(0).toUpperCase() + recipients.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">Notification History</h3>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-foreground">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">{notification.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">{notification.type}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-success" /> Sent to {notification.recipients}
                      </span>
                    </div>
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
