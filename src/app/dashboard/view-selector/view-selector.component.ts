import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Profile, ProfileProviderService } from 'src/app/services/profile-provider/profile-provider.service';

type FilterTab = 'All' | string;

@Component({
    selector: 'app-view-selector',
    templateUrl: './view-selector.component.html',
    styleUrls: ['./view-selector.component.less'],
    standalone: false
})
export class ViewSelectorComponent implements OnInit {
  @Input() profileControl?: FormControl;
  @Output() showViewSelection = new EventEmitter<any>();

  searchQuery = '';
  activeFilter: FilterTab = 'All';
  selectedProfile: Profile | null = null;
  allProfiles: Profile[] = [];

  readonly filterTabs: FilterTab[] = ['All'];

  constructor(protected profileProvide: ProfileProviderService) {}

  ngOnInit(): void {
    this.profileProvide.mappingProfiles$.subscribe(profiles => {
      this.allProfiles = profiles;
      this.buildFilterTabs(profiles);
    });
  }

  private buildFilterTabs(profiles: Profile[]): void {
    const seen = new Set<string>();
    profiles.forEach(p => p.shareholders?.forEach(s => { if (s && s !== 'All') seen.add(s); }));
    const dynamic = Array.from(seen).slice(0, 3);
    (this.filterTabs as string[]).length = 0;
    (this.filterTabs as string[]).push('All', ...dynamic);
  }

  get filteredProfiles(): Profile[] {
    return this.allProfiles.filter(p => {
      const matchesSearch = !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesFilter = this.activeFilter === 'All' ||
        p.shareholders?.includes(this.activeFilter);
      return matchesSearch && matchesFilter;
    });
  }

  @Output() profileDetailsChange = new EventEmitter<Profile | null>();

  selectProfile(profile: Profile): void {
    this.selectedProfile = profile;
    this.profileDetailsChange.emit(profile);
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

  continue(): void {
    if (!this.selectedProfile) return;
    this.profileControl?.setValue(this.selectedProfile.name);
    this.showViewSelection.emit({ name: this.selectedProfile.name, step: 'profile' });
  }

  back(): void {
    this.showViewSelection.emit({ step: 'back' });
  }
}
