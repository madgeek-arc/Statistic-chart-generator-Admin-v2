import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MappingProfilesService, Profile } from "../../services/mapping-profiles-service/mapping-profiles.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

type FilterTab = 'All' | string;

@Component({
  selector: 'app-view-selector',
  templateUrl: './view-selector.component.html',
  styleUrls: ['./view-selector.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule
  ],
  standalone: true
})
export class ViewSelectorComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private profileService = inject(MappingProfilesService);

  profileDetailsChange = output<{ profile: Profile, manualChange: boolean } | null>();

  // Signals: the profiles and the selection arrive from the service, and the component is OnPush.
  searchQuery = signal('');
  activeFilter = signal<FilterTab>('All');
  selectedProfile = signal<Profile | null>(null);
  allProfiles = signal<Profile[]>([]);

  readonly filterTabs = signal<FilterTab[]>(['All']);

  readonly filteredProfiles = computed<Profile[]>(() => {
    const query = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();
    return this.allProfiles().filter(p => {
      const matchesSearch = !query ||
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query);
      const matchesFilter = filter === 'All' ||
        p.shareholders?.includes(filter);
      return matchesSearch && matchesFilter;
    });
  });

  ngOnInit(): void {

    this.profileService.mappingProfiles$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(profiles => {
      this.allProfiles.set(profiles);
      this.buildFilterTabs(profiles);
    });

    this.profileService.selectedProfile$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(profile => {
      this.selectProfile(profile, false);
    });
  }

  private buildFilterTabs(profiles: Profile[]): void {
    const seen = new Set<string>();
    profiles.forEach(p => p.shareholders?.forEach(s => { if (s && s !== 'All') seen.add(s); }));
    const dynamic = Array.from(seen).slice(0, 3);
    this.filterTabs.set(['All', ...dynamic]);
  }

  selectProfile(profile: Profile, manualChange = true): void {
    this.selectedProfile.set(profile);
    this.profileDetailsChange.emit({profile, manualChange});
  }

  getAvatarText(name: string): string {
    return name.split(/[\s_-]+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  getTagClass(tag: string, index: number): string {
    if (index > 0) return '';
    const t = tag.toLowerCase();
    if (t.includes('monitor')) return 'vs-tag--monitors';
    if (t.includes('themat')) return 'vs-tag--thematic';
    if (t.includes('internal')) return 'vs-tag--internal';
    return '';
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
