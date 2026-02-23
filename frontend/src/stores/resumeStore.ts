import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  id: string
  degree: string
  school: string
  field: string
  startDate: string
  endDate: string
}

interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  summary: string
}

interface Resume {
  personalInfo: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: string[]
  languages: string[]
  certifications: string[]
}

interface ResumeStore {
  resume: Resume
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void
  updateExperience: (id: string, field: keyof Experience, value: string) => void
  addExperience: () => void
  removeExperience: (id: string) => void
  updateEducation: (id: string, field: keyof Education, value: string) => void
  addEducation: () => void
  removeEducation: (id: string) => void
  updateSkills: (skills: string[]) => void
  resetResume: () => void
}

const initialResume: Resume = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: initialResume,
      
      updatePersonalInfo: (field, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            personalInfo: { ...state.resume.personalInfo, [field]: value },
          },
        })),
      
      updateExperience: (id, field, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.map((exp) =>
              exp.id === id ? { ...exp, [field]: value } : exp
            ),
          },
        })),
      
      addExperience: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: [
              ...state.resume.experience,
              {
                id: crypto.randomUUID(),
                title: '',
                company: '',
                startDate: '',
                endDate: '',
                description: '',
              },
            ],
          },
        })),
      
      removeExperience: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.filter((exp) => exp.id !== id),
          },
        })),
      
      updateEducation: (id, field, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.map((edu) =>
              edu.id === id ? { ...edu, [field]: value } : edu
            ),
          },
        })),
      
      addEducation: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: [
              ...state.resume.education,
              {
                id: crypto.randomUUID(),
                degree: '',
                school: '',
                field: '',
                startDate: '',
                endDate: '',
              },
            ],
          },
        })),
      
      removeEducation: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.filter((edu) => edu.id !== id),
          },
        })),
      
      updateSkills: (skills) =>
        set((state) => ({
          resume: { ...state.resume, skills },
        })),
      
      resetResume: () => set({ resume: initialResume }),
    }),
    {
      name: 'resume-storage',
    }
  )
)
