import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { notificationsAPI } from '@/services/api';
import { cn } from '@/lib/utils';

export default function ParentNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationsAPI.getAll({ role: 'parent' }); // Assuming filter
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PageHeader title="Notifications" subtitle="School announcements and notices" />

            <div className="max-w-4xl mx-auto space-y-4">
                {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No notifications found.</p>
                ) : (
                    notifications.map((note) => (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1",
                                note.type === 'alert' ? "bg-destructive" :
                                    note.type === 'info' ? "bg-info" :
                                        "bg-primary"
                            )} />
                            <div className="flex gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    note.type === 'alert' ? "bg-destructive/10 text-destructive" :
                                        note.type === 'info' ? "bg-info/10 text-info" :
                                            "bg-primary/10 text-primary"
                                )}>
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-start w-full">
                                        <h3 className="font-semibold text-foreground text-lg">{note.title}</h3>
                                        <span className="text-xs text-muted-foreground">{new Date(note.createdAt || note.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{note.message}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
