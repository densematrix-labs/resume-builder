import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Sparkles, Download, Plus, Trash2, GripVertical } from 'lucide-react'
import { useDeviceId } from '../lib/fingerprint'
import { useResumeStore } from '../stores/resumeStore'
import { generateContent } from '../lib/api'

// Types are defined in resumeStore

export default function BuilderPage() {
  const { t, i18n } = useTranslation()
  const deviceId = useDeviceId()
  const { resume, updatePersonalInfo, updateExperience, updateEducation, addExperience, removeExperience, addEducation, removeEducation, updateSkills } = useResumeStore()
  
  const [activeSection, setActiveSection] = useState('personal')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (section: string, context?: string) => {
    if (!deviceId) return
    
    setGenerating(true)
    setError(null)
    
    try {
      const content = await generateContent({
        job_title: resume.personalInfo.title || 'Professional',
        section,
        context,
        language: i18n.language,
      }, deviceId)
      
      // Update the appropriate field based on section
      if (section === 'summary') {
        updatePersonalInfo('summary', content)
      } else if (section === 'skills') {
        updateSkills(content.split(',').map((s: string) => s.trim()))
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const sections = [
    { id: 'personal', label: t('builder.personal_info') },
    { id: 'experience', label: t('builder.experience') },
    { id: 'education', label: t('builder.education') },
    { id: 'skills', label: t('builder.skills') },
  ]

  return (
    <div className="py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Editor Panel */}
          <div className="lg:w-1/2">
            <div className="card mb-6">
              <h1 className="font-display text-2xl font-bold mb-6">
                {t('builder.title')}
              </h1>

              {/* Section Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Personal Info Section */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      {t('form.full_name')}
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.name}
                      onChange={e => updatePersonalInfo('name', e.target.value)}
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      {t('form.job_title')}
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.title}
                      onChange={e => updatePersonalInfo('title', e.target.value)}
                      className="input"
                      placeholder="Software Engineer"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        {t('form.email')}
                      </label>
                      <input
                        type="email"
                        value={resume.personalInfo.email}
                        onChange={e => updatePersonalInfo('email', e.target.value)}
                        className="input"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        {t('form.phone')}
                      </label>
                      <input
                        type="tel"
                        value={resume.personalInfo.phone}
                        onChange={e => updatePersonalInfo('phone', e.target.value)}
                        className="input"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      {t('form.location')}
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.location}
                      onChange={e => updatePersonalInfo('location', e.target.value)}
                      className="input"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-400">
                        {t('form.summary')}
                      </label>
                      <button
                        onClick={() => handleGenerate('summary')}
                        disabled={generating}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        {generating ? t('builder.generating') : t('builder.generate_ai')}
                      </button>
                    </div>
                    <textarea
                      value={resume.personalInfo.summary}
                      onChange={e => updatePersonalInfo('summary', e.target.value)}
                      className="input min-h-[120px] resize-none"
                      placeholder="A brief professional summary..."
                    />
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {activeSection === 'experience' && (
                <div className="space-y-6">
                  {resume.experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">Experience {index + 1}</span>
                        </div>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={e => updateExperience(exp.id, 'title', e.target.value)}
                          className="input"
                          placeholder={t('form.job_title')}
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                          className="input"
                          placeholder={t('form.company')}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                            className="input"
                            placeholder={t('form.start_date')}
                          />
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                            className="input"
                            placeholder={t('form.end_date')}
                          />
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                          className="input min-h-[80px] resize-none"
                          placeholder={t('form.description')}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addExperience}
                    className="w-full btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('builder.add_section')}
                  </button>
                </div>
              )}

              {/* Education Section */}
              {activeSection === 'education' && (
                <div className="space-y-6">
                  {resume.education.map((edu, index) => (
                    <div key={edu.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">Education {index + 1}</span>
                        </div>
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                          className="input"
                          placeholder={t('form.degree')}
                        />
                        <input
                          type="text"
                          value={edu.school}
                          onChange={e => updateEducation(edu.id, 'school', e.target.value)}
                          className="input"
                          placeholder={t('form.school')}
                        />
                        <input
                          type="text"
                          value={edu.field}
                          onChange={e => updateEducation(edu.id, 'field', e.target.value)}
                          className="input"
                          placeholder={t('form.field')}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={edu.startDate}
                            onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}
                            className="input"
                            placeholder={t('form.start_date')}
                          />
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                            className="input"
                            placeholder={t('form.end_date')}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addEducation}
                    className="w-full btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('builder.add_section')}
                  </button>
                </div>
              )}

              {/* Skills Section */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-400">
                      {t('builder.skills')}
                    </label>
                    <button
                      onClick={() => handleGenerate('skills')}
                      disabled={generating}
                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      {generating ? t('builder.generating') : t('builder.generate_ai')}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-full text-sm"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => {
                            const newSkills = [...resume.skills]
                            newSkills.splice(index, 1)
                            updateSkills(newSkills)
                          }}
                          className="text-slate-500 hover:text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <input
                    type="text"
                    className="input"
                    placeholder="Add a skill and press Enter"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        updateSkills([...resume.skills, e.currentTarget.value.trim()])
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Download Button */}
            <button className="w-full btn btn-primary flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              {t('builder.download')}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="lg:w-1/2">
            <div className="sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">
                {t('builder.preview')}
              </h2>
              <div className="bg-white rounded-lg shadow-2xl aspect-[8.5/11] p-8 text-slate-900">
                {/* Resume Preview */}
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="text-center mb-6 pb-4 border-b border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {resume.personalInfo.name || 'Your Name'}
                    </h3>
                    <p className="text-lg text-slate-600">
                      {resume.personalInfo.title || 'Job Title'}
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-2 text-sm text-slate-500">
                      {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                      {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
                      {resume.personalInfo.location && <span>{resume.personalInfo.location}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resume.personalInfo.summary && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {resume.personalInfo.summary}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {resume.experience.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Experience
                      </h4>
                      {resume.experience.map(exp => (
                        <div key={exp.id} className="mb-3">
                          <div className="flex justify-between">
                            <span className="font-semibold text-sm">{exp.title || 'Position'}</span>
                            <span className="text-xs text-slate-500">
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{exp.company}</p>
                          <p className="text-xs text-slate-500 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {resume.education.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Education
                      </h4>
                      {resume.education.map(edu => (
                        <div key={edu.id} className="mb-2">
                          <div className="flex justify-between">
                            <span className="font-semibold text-sm">{edu.degree || 'Degree'}</span>
                            <span className="text-xs text-slate-500">
                              {edu.startDate} - {edu.endDate}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{edu.school}</p>
                          <p className="text-xs text-slate-500">{edu.field}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {resume.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
