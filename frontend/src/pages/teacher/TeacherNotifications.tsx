import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Clock } from 'lucide-react';
import { notificationsAPI } from '@/services/api';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function TeacherNotifications() {
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationsAPI.getAll();
            if (res.success) {
                setNotifications(res.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            toast({ title: "Marked as read" });
        } catch (error) {
            toast({ title: "Error", description: "Could not mark as read", variant: "destructive" });
        }
    };

    const markAllRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast({ title: "All notifications marked as read" });
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PageHeader
                title="Notifications"
                subtitle="Stay updated with school announcements and alerts"
                action={{
                    label: "Mark All Read",
                    icon: Check,
                    onClick: markAllRead
                }}
            />

            <div className="space-y-4 max-w-3xl mx-auto mt-6">
                {loading && <p className="text-center text-muted-foreground">Loading notifications...</p>}

                {!loading && notifications.length === 0 && (
                    <div className="text-center py-12 bg-muted/20 rounded-xl border border-border dashed">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Notifications</h3>
                        <p className="text-muted-foreground">You're all caught up!</p>
                    </div>
                )}

                {notifications.map((notification) => (
                    <Card key={notification.id} className={`transition-colors ${notification.read ? 'bg-card opacity-70' : 'bg-card border-primary/20 shadow-sm'}`}>
                        <CardContent className="p-4 flex gap-4">
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notification.read ? 'bg-muted-foreground' : 'bg-primary'}`} />
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {notification.createdAt ? format(new Date(notification.createdAt), 'MMM d, h:mm a') : 'Just now'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {notification.message}
                                </p>
                                {!notification.read && (
                                    <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => markAsRead(notification.id)}>
                                        Mark as Read
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </motion.div>
    );
}
