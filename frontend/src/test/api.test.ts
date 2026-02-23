import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateContent, getTokenStatus, generateCoverLetter } from '../lib/api'

describe('API module', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('generateContent', () => {
    it('handles successful response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: 'Generated content',
          tokens_remaining: 5,
          source: 'free',
        }),
      })

      const result = await generateContent(
        { job_title: 'Engineer', section: 'experience', language: 'en' },
        'device-123'
      )

      expect(result).toBe('Generated content')
    })

    it('handles string error detail', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Something went wrong' }),
      })

      await expect(
        generateContent(
          { job_title: 'Engineer', section: 'experience', language: 'en' },
          'device-123'
        )
      ).rejects.toThrow('Something went wrong')
    })

    it('handles object error detail with error field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: 'No tokens remaining', code: 'payment_required' },
        }),
      })

      await expect(
        generateContent(
          { job_title: 'Engineer', section: 'experience', language: 'en' },
          'device-123'
        )
      ).rejects.toThrow('No tokens remaining')
    })

    it('handles object error detail with message field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          detail: { message: 'Invalid input' },
        }),
      })

      await expect(
        generateContent(
          { job_title: 'Engineer', section: 'experience', language: 'en' },
          'device-123'
        )
      ).rejects.toThrow('Invalid input')
    })

    it('does not throw [object Object]', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: 'Payment required', code: 'payment_required' },
        }),
      })

      try {
        await generateContent(
          { job_title: 'Engineer', section: 'experience', language: 'en' },
          'device-123'
        )
      } catch (e: any) {
        expect(e.message).not.toContain('[object Object]')
        expect(e.message).not.toContain('object Object')
      }
    })
  })

  describe('getTokenStatus', () => {
    it('returns token status on success', async () => {
      const mockStatus = {
        tokens_remaining: 10,
        daily_used: 2,
        daily_limit: 5,
        can_generate: true,
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      })

      const result = await getTokenStatus('device-123')
      expect(result).toEqual(mockStatus)
    })

    it('throws on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(getTokenStatus('device-123')).rejects.toThrow(
        'Failed to fetch token status'
      )
    })
  })

  describe('generateCoverLetter', () => {
    it('returns cover letter content on success', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: 'Dear Hiring Manager...',
          tokens_remaining: 4,
          source: 'free',
        }),
      })

      const result = await generateCoverLetter(
        {
          job_title: 'Engineer',
          company: 'Tech Corp',
          resume_summary: 'Experienced engineer...',
          language: 'en',
        },
        'device-123'
      )

      expect(result).toBe('Dear Hiring Manager...')
    })
  })
})
