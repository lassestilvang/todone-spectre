import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useCollaboration } from '../../hooks/useCollaboration';
import { CollaborationSettings } from '../../types/collaboration';
import { Settings, Bell, Lock, Globe, Users, ShieldCheck, Save, RefreshCw, AlertTriangle, Key, Link, Calendar, FileText, MessageSquare, UserPlus, Trash2, Plus, Minus, Info, Check, X, ExternalLink } from 'lucide-react';

interface CollaborationSettingsProps {
  teamId: string;
  initialSettings?: Partial<CollaborationSettings>;
  onSave?: (settings: CollaborationSettings) => void;
  onCancel?: () => void;
  showAdvanced?: boolean;
}

export const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({
  teamId,
  initialSettings,
  onSave,
  onCancel,
  showAdvanced = true
}) => {
  const { settings, updateTeamSettings, loading, error } = useCollaboration();
  const [currentSettings, setCurrentSettings] = useState<CollaborationSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<CollaborationSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Get team settings
  const teamSettings = settings.find(s => s.teamId === teamId) || initialSettings;

  // Initialize settings
  useEffect(() => {
    if (teamSettings) {
      setCurrentSettings({
        teamId: teamId,
        notificationSettings: {
          emailNotifications: teamSettings.notificationSettings?.emailNotifications || true,
          pushNotifications: teamSettings.notificationSettings?.pushNotifications || true,
          mentionNotifications: teamSettings.notificationSettings?.mentionNotifications || true,
          dailyDigest: teamSettings.notificationSettings?.dailyDigest || false
        },
        permissionSettings: {
          allowGuestInvites: teamSettings.permissionSettings?.allowGuestInvites || false,
          allowPublicSharing: teamSettings.permissionSettings?.allowPublicSharing || false,
          requireAdminApproval: teamSettings.permissionSettings?.requireAdminApproval || true,
          allowMemberInvites: teamSettings.permissionSettings?.allowMemberInvites || false
        },
        privacySettings: {
          visibleToPublic: teamSettings.privacySettings?.visibleToPublic || false,
          searchable: teamSettings.privacySettings?.searchable || false,
          allowExternalAccess: teamSettings.privacySettings?.allowExternalAccess || false
        },
        integrationSettings: {
          calendarIntegration: teamSettings.integrationSettings?.calendarIntegration || false,
          taskIntegration: teamSettings.integrationSettings?.taskIntegration || false,
          fileIntegration: teamSettings.integrationSettings?.fileIntegration || false
        },
        updatedAt: new Date()
      });

      setOriginalSettings({
        teamId: teamId,
        notificationSettings: {
          emailNotifications: teamSettings.notificationSettings?.emailNotifications || true,
          pushNotifications: teamSettings.notificationSettings?.pushNotifications || true,
          mentionNotifications: teamSettings.notificationSettings?.mentionNotifications || true,
          dailyDigest: teamSettings.notificationSettings?.dailyDigest || false
        },
        permissionSettings: {
          allowGuestInvites: teamSettings.permissionSettings?.allowGuestInvites || false,
          allowPublicSharing: teamSettings.permissionSettings?.allowPublicSharing || false,
          requireAdminApproval: teamSettings.permissionSettings?.requireAdminApproval || true,
          allowMemberInvites: teamSettings.permissionSettings?.allowMemberInvites || false
        },
        privacySettings: {
          visibleToPublic: teamSettings.privacySettings?.visibleToPublic || false,
          searchable: teamSettings.privacySettings?.searchable || false,
          allowExternalAccess: teamSettings.privacySettings?.allowExternalAccess || false
        },
        integrationSettings: {
          calendarIntegration: teamSettings.integrationSettings?.calendarIntegration || false,
          taskIntegration: teamSettings.integrationSettings?.taskIntegration || false,
          fileIntegration: teamSettings.integrationSettings?.fileIntegration || false
        },
        updatedAt: new Date()
      });
    }
  }, [teamId, teamSettings, initialSettings]);

  const handleInputChange = (category: keyof CollaborationSettings, field: string, value: any) => {
    if (!currentSettings) return;

    setCurrentSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [field]: value
      }
    }));
  };

  const handleSwitchChange = (category: keyof CollaborationSettings, field: string, checked: boolean) => {
    handleInputChange(category, field, checked);
  };

  const handleSelectChange = (category: keyof CollaborationSettings, field: string, value: string) => {
    handleInputChange(category, field, value);
  };

  const handleSave = async () => {
    if (!currentSettings) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      if (onSave) {
        await onSave(currentSettings);
      } else if (updateTeamSettings) {
        await updateTeamSettings(teamId, currentSettings);
      }

      setSaveSuccess(true);
      setOriginalSettings({ ...currentSettings });

      // Auto-close success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setCurrentSettings({ ...originalSettings });
      setSaveSuccess(false);
      setSaveError(null);
    }
    setIsResetDialogOpen(false);
  };

  const hasChanges = () => {
    if (!currentSettings || !originalSettings) return false;

    return JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
  };

  const getSettingDescription = (category: keyof CollaborationSettings, field: string) => {
    const descriptions: Record<string, string> = {
      'notificationSettings.emailNotifications': 'Receive email updates about team activities and mentions',
      'notificationSettings.pushNotifications': 'Get real-time push notifications for important events',
      'notificationSettings.mentionNotifications': 'Get notified when someone mentions you in comments or discussions',
      'notificationSettings.dailyDigest': 'Receive a daily summary of team activities via email',

      'permissionSettings.allowGuestInvites': 'Allow team members to invite guests to the team',
      'permissionSettings.allowPublicSharing': 'Allow sharing team content publicly outside the organization',
      'permissionSettings.requireAdminApproval': 'New members require admin approval before joining',
      'permissionSettings.allowMemberInvites': 'Allow regular members to invite new members',

      'privacySettings.visibleToPublic': 'Make team visible to public users (not just team members)',
      'privacySettings.searchable': 'Allow team to be discovered through search',
      'privacySettings.allowExternalAccess': 'Allow external users to access team resources',

      'integrationSettings.calendarIntegration': 'Enable calendar integration for team events and deadlines',
      'integrationSettings.taskIntegration': 'Enable task integration with external project management tools',
      'integrationSettings.fileIntegration': 'Enable file integration with cloud storage providers'
    };

    return descriptions[`${category}.${field}`] || '';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Collaboration Settings</CardTitle>
          <CardDescription>Loading team settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Collaboration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p>Failed to load team settings</p>
            <Button variant="outline" size="sm" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSettings) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Collaboration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <Info className="h-6 w-6 mx-auto mb-2" />
            <p>No settings available for this team</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Collaboration Settings</span>
            </CardTitle>
            <CardDescription>Configure your team's collaboration preferences</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges() && (
              <Badge variant="outline" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {saveSuccess && (
          <Alert variant="success" className="mb-4">
            <Check className="h-4 w-4" />
            <AlertTitle>Settings saved successfully!</AlertTitle>
            <AlertDescription>
              Your collaboration settings have been updated.
            </AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Failed to save settings</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Lock className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            {showAdvanced && (
              <TabsTrigger value="integrations">
                <Link className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
            )}
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <div className="space-y-6">
              <Alert variant="info">
                <AlertTitle>General Settings</AlertTitle>
                <AlertDescription>
                  Configure basic team information and collaboration preferences
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={currentSettings.teamId}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Team ID is used for internal reference</p>
                </div>

                <div className="space-y-2">
                  <Label>Team Privacy</Label>
                  <Select
                    value={currentSettings.privacySettings.visibleToPublic ? 'public' : 'private'}
                    onValueChange={(value) => {
                      const visibleToPublic = value === 'public';
                      handleInputChange('privacySettings', 'visibleToPublic', visibleToPublic);
                      handleInputChange('privacySettings', 'searchable', visibleToPublic);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy setting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private (Team members only)</SelectItem>
                      <SelectItem value="public">Public (Visible to everyone)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {currentSettings.privacySettings.visibleToPublic
                      ? 'Team is visible to public users and can be discovered through search'
                      : 'Team is only visible to team members'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Settings Tab */}
          <TabsContent value="notifications">
            <div className="space-y-4">
              <Alert variant="info">
                <AlertTitle>Notification Settings</AlertTitle>
                <AlertDescription>
                  Configure how team members receive notifications about collaboration activities
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('notificationSettings', 'emailNotifications')}
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={currentSettings.notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('notificationSettings', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="pushNotifications" className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('notificationSettings', 'pushNotifications')}
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={currentSettings.notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('notificationSettings', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="mentionNotifications" className="font-medium">Mention Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('notificationSettings', 'mentionNotifications')}
                    </p>
                  </div>
                  <Switch
                    id="mentionNotifications"
                    checked={currentSettings.notificationSettings.mentionNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('notificationSettings', 'mentionNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="dailyDigest" className="font-medium">Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('notificationSettings', 'dailyDigest')}
                    </p>
                  </div>
                  <Switch
                    id="dailyDigest"
                    checked={currentSettings.notificationSettings.dailyDigest}
                    onCheckedChange={(checked) => handleSwitchChange('notificationSettings', 'dailyDigest', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Permissions Settings Tab */}
          <TabsContent value="permissions">
            <div className="space-y-4">
              <Alert variant="warning">
                <AlertTitle>Permission Settings</AlertTitle>
                <AlertDescription>
                  Control who can access and modify team resources and settings
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="allowGuestInvites" className="font-medium">Allow Guest Invites</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('permissionSettings', 'allowGuestInvites')}
                    </p>
                  </div>
                  <Switch
                    id="allowGuestInvites"
                    checked={currentSettings.permissionSettings.allowGuestInvites}
                    onCheckedChange={(checked) => handleSwitchChange('permissionSettings', 'allowGuestInvites', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="allowPublicSharing" className="font-medium">Allow Public Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('permissionSettings', 'allowPublicSharing')}
                    </p>
                  </div>
                  <Switch
                    id="allowPublicSharing"
                    checked={currentSettings.permissionSettings.allowPublicSharing}
                    onCheckedChange={(checked) => handleSwitchChange('permissionSettings', 'allowPublicSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="requireAdminApproval" className="font-medium">Require Admin Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('permissionSettings', 'requireAdminApproval')}
                    </p>
                  </div>
                  <Switch
                    id="requireAdminApproval"
                    checked={currentSettings.permissionSettings.requireAdminApproval}
                    onCheckedChange={(checked) => handleSwitchChange('permissionSettings', 'requireAdminApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="allowMemberInvites" className="font-medium">Allow Member Invites</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('permissionSettings', 'allowMemberInvites')}
                    </p>
                  </div>
                  <Switch
                    id="allowMemberInvites"
                    checked={currentSettings.permissionSettings.allowMemberInvites}
                    onCheckedChange={(checked) => handleSwitchChange('permissionSettings', 'allowMemberInvites', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Settings Tab */}
          <TabsContent value="privacy">
            <div className="space-y-4">
              <Alert variant="info">
                <AlertTitle>Privacy Settings</AlertTitle>
                <AlertDescription>
                  Control team visibility and access permissions
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="visibleToPublic" className="font-medium">Visible to Public</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('privacySettings', 'visibleToPublic')}
                    </p>
                  </div>
                  <Switch
                    id="visibleToPublic"
                    checked={currentSettings.privacySettings.visibleToPublic}
                    onCheckedChange={(checked) => handleSwitchChange('privacySettings', 'visibleToPublic', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="searchable" className="font-medium">Searchable</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('privacySettings', 'searchable')}
                    </p>
                  </div>
                  <Switch
                    id="searchable"
                    checked={currentSettings.privacySettings.searchable}
                    onCheckedChange={(checked) => handleSwitchChange('privacySettings', 'searchable', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="allowExternalAccess" className="font-medium">Allow External Access</Label>
                    <p className="text-sm text-muted-foreground">
                      {getSettingDescription('privacySettings', 'allowExternalAccess')}
                    </p>
                  </div>
                  <Switch
                    id="allowExternalAccess"
                    checked={currentSettings.privacySettings.allowExternalAccess}
                    onCheckedChange={(checked) => handleSwitchChange('privacySettings', 'allowExternalAccess', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Integrations Settings Tab */}
          {showAdvanced && (
            <TabsContent value="integrations">
              <div className="space-y-4">
                <Alert variant="info">
                  <AlertTitle>Integration Settings</AlertTitle>
                  <AlertDescription>
                    Connect your team with external services and tools
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="calendarIntegration" className="font-medium">Calendar Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        {getSettingDescription('integrationSettings', 'calendarIntegration')}
                      </p>
                    </div>
                    <Switch
                      id="calendarIntegration"
                      checked={currentSettings.integrationSettings.calendarIntegration}
                      onCheckedChange={(checked) => handleSwitchChange('integrationSettings', 'calendarIntegration', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="taskIntegration" className="font-medium">Task Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        {getSettingDescription('integrationSettings', 'taskIntegration')}
                      </p>
                    </div>
                    <Switch
                      id="taskIntegration"
                      checked={currentSettings.integrationSettings.taskIntegration}
                      onCheckedChange={(checked) => handleSwitchChange('integrationSettings', 'taskIntegration', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="fileIntegration" className="font-medium">File Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        {getSettingDescription('integrationSettings', 'fileIntegration')}
                      </p>
                    </div>
                    <Switch
                      id="fileIntegration"
                      checked={currentSettings.integrationSettings.fileIntegration}
                      onCheckedChange={(checked) => handleSwitchChange('integrationSettings', 'fileIntegration', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {hasChanges() && (
            <Button variant="outline" size="sm" onClick={() => setIsResetDialogOpen(true)}>
              <X className="h-4 w-4 mr-2" />
              Reset Changes
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges()}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};