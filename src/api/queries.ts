import { useQuery } from '@tanstack/react-query';
import { api, ApiItem } from './index';

export const queryKeys = {
  structures: ['structures'] as const,
  faculties: (structureId: string) => ['faculties', structureId] as const,
  courses: (structureId: string, facultyId: string) => ['courses', structureId, facultyId] as const,
  groups: (structureId: string, facultyId: string, course: string) =>
    ['groups', structureId, facultyId, course] as const,
  chairs: (structureId: string) => ['chairs', structureId] as const,
  teachers: (structureId: string, chairId: string) => ['teachers', structureId, chairId] as const,
  groupSchedule: (
    structureId: string,
    facultyId: string,
    course: string,
    groupId: string,
    startDate?: string,
    endDate?: string,
  ) => ['groupSchedule', structureId, facultyId, course, groupId, startDate, endDate] as const,
  teacherSchedule: (
    structureId: string,
    chairId: string,
    teacherId: string,
    startDate?: string,
    endDate?: string,
  ) => ['teacherSchedule', structureId, chairId, teacherId, startDate, endDate] as const,
};

export function useStructures() {
  return useQuery({
    queryKey: queryKeys.structures,
    queryFn: api.structures,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useFaculties(structureId?: string) {
  return useQuery({
    queryKey: queryKeys.faculties(structureId!),
    queryFn: () => api.faculties(structureId!),
    enabled: structureId !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useCourses(structureId?: string, facultyId?: string) {
  return useQuery({
    queryKey: queryKeys.courses(structureId!, facultyId!),
    queryFn: () => api.courses(structureId!, facultyId!),
    enabled: structureId !== undefined && facultyId !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useGroups(structureId?: string, facultyId?: string, course?: string) {
  return useQuery({
    queryKey: queryKeys.groups(structureId!, facultyId!, course!),
    queryFn: () => api.groups(structureId!, facultyId!, course!),
    enabled: structureId !== undefined && facultyId !== undefined && course !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useChairs(structureId?: string) {
  return useQuery({
    queryKey: queryKeys.chairs(structureId!),
    queryFn: () => api.chairs(structureId!),
    enabled: structureId !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useTeachers(structureId?: string, chairId?: string) {
  return useQuery({
    queryKey: queryKeys.teachers(structureId!, chairId!),
    queryFn: () => api.teachers(structureId!, chairId!),
    enabled: structureId !== undefined && chairId !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useGroupSchedule(
  structureId?: string,
  facultyId?: string,
  course?: string,
  groupId?: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: queryKeys.groupSchedule(
      structureId!,
      facultyId!,
      course!,
      groupId!,
      startDate,
      endDate,
    ),
    queryFn: () =>
      api.groupSchedule(structureId!, facultyId!, course!, groupId!, startDate, endDate),
    enabled:
      structureId !== undefined &&
      facultyId !== undefined &&
      course !== undefined &&
      groupId !== undefined,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherSchedule(
  structureId?: string,
  chairId?: string,
  teacherId?: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: queryKeys.teacherSchedule(structureId!, chairId!, teacherId!, startDate, endDate),
    queryFn: () => api.teacherSchedule(structureId!, chairId!, teacherId!, startDate, endDate),
    enabled: structureId !== undefined && chairId !== undefined && teacherId !== undefined,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllTeachers() {
  return useQuery({
    queryKey: ['allTeachers'],
    queryFn: async () => {
      const structures = await api.structures();
      
      const chairsPromises = structures.map((s) =>
        api.chairs(s.id).then((chairs) => ({ structureId: s.id, chairs })).catch(() => null)
      );
      const structuresChairs = await Promise.all(chairsPromises);

      const teacherPromises: Promise<ApiItem[]>[] = [];
      for (const sc of structuresChairs) {
        if (!sc) continue;
        for (const chair of sc.chairs) {
          teacherPromises.push(
            api.teachers(sc.structureId, chair.id).catch(() => [])
          );
        }
      }

      const teachersArrays = await Promise.all(teacherPromises);
      return teachersArrays.flat();
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}
