import { z } from 'zod';

const BASE_URL = 'https://mkr.sergkh.com';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const ApiItemSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
});
export type ApiItem = z.infer<typeof ApiItemSchema>;

export const ApiGroupSchema = ApiItemSchema.extend({
  course: z.coerce.string().optional(),
});
export type ApiGroup = z.infer<typeof ApiGroupSchema>;

export const LessonTypeSchema = z.string();
export type LessonType = z.infer<typeof LessonTypeSchema>;

export const ScheduleItemSchema = z.object({
  name: z.string(),
  place: z.string(),
  group: z.string().optional(),
  teacher: z.string().optional(),
  type: LessonTypeSchema,
  start: z.string(),
  end: z.string(),
  updated: z.boolean().or(z.string()).optional(),
  added: z.boolean().or(z.string()).optional(),
});
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;

export const api = {
  structures: async () => {
    const data = await get<unknown>('/structures');
    return z.array(ApiItemSchema).parse(data);
  },

  faculties: async (structureId: string) => {
    const data = await get<unknown>(`/structures/${structureId}/faculties`);
    return z.array(ApiItemSchema).parse(data);
  },

  courses: async (structureId: string, facultyId: string) => {
    const data = await get<unknown>(`/structures/${structureId}/faculties/${facultyId}/courses`);
    return z.array(ApiItemSchema).parse(data);
  },

  groups: async (structureId: string, facultyId: string, course: string) => {
    const data = await get<unknown>(
      `/structures/${structureId}/faculties/${facultyId}/courses/${course}/groups`,
    );
    return z.array(ApiGroupSchema).parse(data);
  },

  chairs: async (structureId: string) => {
    const data = await get<unknown>(`/structures/${structureId}/chairs`);
    return z.array(ApiItemSchema).parse(data);
  },

  teachers: async (structureId: string, chairId: string) => {
    const data = await get<unknown>(`/structures/${structureId}/chairs/${chairId}/teachers`);
    return z.array(ApiItemSchema).parse(data);
  },

  groupSchedule: async (
    structureId: string,
    facultyId: string,
    course: string,
    groupId: string,
    startDate?: string,
    endDate?: string,
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    const data = await get<unknown>(
      `/structures/${structureId}/faculties/${facultyId}/courses/${course}/groups/${groupId}/schedule${query}`,
    );
    return z.array(ScheduleItemSchema).parse(data);
  },

  teacherSchedule: async (
    structureId: string,
    chairId: string,
    teacherId: string,
    startDate?: string,
    endDate?: string,
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    const data = await get<unknown>(
      `/structures/${structureId}/chairs/${chairId}/teachers/${teacherId}/schedule${query}`,
    );
    return z.array(ScheduleItemSchema).parse(data);
  },
};
