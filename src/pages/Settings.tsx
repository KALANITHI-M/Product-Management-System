
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { Settings as SettingsIcon, User, Bell, Shield, Save, Database } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { dbSettings, setDBSettings, testDBConnection } = useData();

  // Account settings
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState("admin@example.com");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [materialAlerts, setMaterialAlerts] = useState(true);
  
  // Database settings
  const [dbHost, setDbHost] = useState(dbSettings.host);
  const [dbUser, setDbUser] = useState(dbSettings.user);
  const [dbPassword, setDbPassword] = useState(dbSettings.password || "");
  const [dbName, setDbName] = useState(dbSettings.database);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "idle" | "testing" | "success" | "error";
    message?: string;
  }>({ status: "idle" });
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  const handlePasswordChange = () => {
    toast({
      title: "Password changed",
      description: "Your password has been changed successfully.",
    });
  };
  
  const handleDatabaseSave = async () => {
    const newSettings = {
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName
    };
    
    setDBSettings(newSettings);
    
    toast({
      title: "Database settings saved",
      description: "The database configuration has been updated.",
      variant: "success",
    });
  };
  
  const handleTestConnection = async () => {
    setConnectionStatus({ status: "testing" });
    
    const result = await testDBConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });
    
    if (result.status === "success") {
      setConnectionStatus({ status: "success", message: result.message });
    } else {
      setConnectionStatus({ status: "error", message: result.message });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          <SettingsIcon className="mr-2" size={24} />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid grid-cols-4 w-full max-w-md mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2" size={18} />
                Account Information
              </CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2" size={18} />
                Notification Settings
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about your activities
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="product-updates">Product Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when products status changes
                  </p>
                </div>
                <Switch
                  id="product-updates"
                  checked={productUpdates}
                  onCheckedChange={setProductUpdates}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="material-alerts">Material Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when material inventory is low
                  </p>
                </div>
                <Switch
                  id="material-alerts"
                  checked={materialAlerts}
                  onCheckedChange={setMaterialAlerts}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2" size={18} />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePasswordChange}>
                <Save className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2" size={18} />
                Database Configuration
              </CardTitle>
              <CardDescription>Configure your database connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="db-host">Database Host</Label>
                <Input
                  id="db-host"
                  value={dbHost}
                  onChange={(e) => setDbHost(e.target.value)}
                  placeholder="localhost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-name">Database Name</Label>
                <Input
                  id="db-name"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="production_manager"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="db-user">Username</Label>
                  <Input
                    id="db-user"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    placeholder="root"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="db-password">Password</Label>
                  <Input
                    id="db-password"
                    type="password"
                    value={dbPassword}
                    onChange={(e) => setDbPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              {connectionStatus.status !== "idle" && (
                <Alert 
                  variant={
                    connectionStatus.status === "testing" ? "default" :
                    connectionStatus.status === "success" ? "success" : "destructive"
                  }
                >
                  <AlertTitle>
                    {connectionStatus.status === "testing" ? "Testing Connection..." :
                     connectionStatus.status === "success" ? "Connection Successful" : "Connection Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {connectionStatus.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={connectionStatus.status === "testing"}
              >
                {connectionStatus.status === "testing" && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Test Connection
              </Button>
              <Button onClick={handleDatabaseSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
