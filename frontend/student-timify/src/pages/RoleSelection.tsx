import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { UserCog, GraduationCap, Users } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "admin",
      title: "Admin",
      description:
        "Manage subjects, faculty, rooms and generate timetables",
      icon: UserCog,
      color: "bg-primary", // same style
      route: "/admin",
    },
    {
      id: "student",
      title: "Student",
      description:
        "Enroll in subjects and view your personalized timetable",
      icon: GraduationCap,
      color: "bg-primary", // same style
      route: "/student",
    },
    {
      id: "staff",
      title: "Staff",
      description:
        "View your assigned classes and teaching schedule",
      icon: Users,
      color: "bg-primary", // same style
      route: "/staff",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            AI Timetable Management System
          </h1>
          <p className="text-xl text-muted-foreground">
            Select your role to continue
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(role.route)}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon
                      className="w-10 h-10 text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    aria-label={`Continue as ${role.title}`}
                    onClick={() => navigate(role.route)}
                  >
                    Continue as {role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
