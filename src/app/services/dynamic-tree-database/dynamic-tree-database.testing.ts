import { HttpTestingController } from '@angular/common/http/testing';

import { Profile } from '../mapping-profiles-service/mapping-profiles.service';
import { CachedEntityNode } from '../../dashboard/helper-components/select-attribute/dynamic-entity-tree/entity-tree-nodes.types';

// Helpers for specs that drive the real DynamicTreeDatabase over HttpTestingController.

export const profileNamed = (name: string): Profile => Object.assign(new Profile(), { name });

export const entityNode = (name: string, fields: Record<string, string>, relations: string[] = []): CachedEntityNode => ({
  name,
  fields: Object.entries(fields).map(([fieldName, type]) => ({ name: fieldName, type })),
  relations
});

// Answers what the API answers once a profile is selected: its entity names, then the fields and
// relations of each entity.
export function answerProfile(http: HttpTestingController, serviceUrl: string, profile: string, entities: CachedEntityNode[]): void {
  http.expectOne(`${serviceUrl}/schema/${profile}/entities`).flush(entities.map(entity => entity.name));
  entities.forEach(entity => http.expectOne(`${serviceUrl}/schema/${profile}/entities/${entity.name}`).flush(entity));
}
