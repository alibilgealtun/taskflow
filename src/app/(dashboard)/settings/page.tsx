import { getShareSettings } from '@/features/share/queries';
import { ShareSettings } from './_components/share-settings';

export default async function SettingsPage() {
  const settings = await getShareSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sharing & Public Access
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage how your task lists can be shared publicly or with external collaborators.
        </p>
      </div>

      <ShareSettings initialSettings={settings} />
    </div>
  );
}
