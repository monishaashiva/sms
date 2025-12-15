import { motion } from 'framer-motion';
import { Plus, Users, Layers } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { classes } from '@/data/dummyData';

export default function ClassManagement() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Classes & Sections"
        subtitle="Manage class structure and student assignments"
      />

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="student-mapping">Student Mapping</TabsTrigger>
          <TabsTrigger value="teacher-mapping">Teacher Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <div className="flex justify-end mb-6">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Class
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-card rounded-xl p-6 shadow-md border border-border/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{cls.sections.length} Sections</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{cls.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">Class Teacher: {cls.classTeacher}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{cls.studentCount} Students</span>
                  </div>
                  <div className="flex gap-1">
                    {cls.sections.map((sec) => (
                      <span key={sec} className="px-2 py-1 bg-muted rounded text-xs font-medium">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">Section Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {classes.flatMap((cls) =>
                cls.sections.map((sec) => (
                  <div key={`${cls.name}-${sec}`} className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <p className="font-semibold text-foreground">{cls.name} - {sec}</p>
                    <p className="text-sm text-muted-foreground mt-1">{Math.floor(cls.studentCount / cls.sections.length)} Students</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="student-mapping">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">Student-Class Mapping</h3>
            <p className="text-muted-foreground mb-4">Assign students to classes and sections</p>
            <div className="flex gap-4 flex-wrap">
              <Button variant="outline">Bulk Assign</Button>
              <Button variant="outline">Import CSV</Button>
              <Button variant="outline">Export Mapping</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teacher-mapping">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">Teacher-Class Mapping</h3>
            <p className="text-muted-foreground mb-4">Assign teachers to classes and subjects</p>
            <div className="flex gap-4 flex-wrap">
              <Button variant="outline">Assign Teacher</Button>
              <Button variant="outline">View Schedule</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
