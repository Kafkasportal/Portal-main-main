import { describe, it, expect } from 'vitest'
import { detectPriorityFromLabels } from '../issues/route'

/**
 * Tests for GitHub Issues Webhook - Priority Detection
 *
 * Priority is automatically determined from GitHub labels:
 * - Critical: Labels containing "critical" or "urgent"
 * - High: Labels containing "high" or "bug"
 * - Medium: Default for all other issues
 * - Low: Labels containing "low" or "minor"
 */
describe('GitHub Issues Webhook - Priority Detection', () => {
  // Helper to create a mock label
  const createLabel = (name: string) => ({
    id: Math.random(),
    name,
    color: '000000',
  })

  describe('Critical Priority', () => {
    it('should detect critical priority from "critical" label', () => {
      const labels = [createLabel('critical')]
      expect(detectPriorityFromLabels(labels)).toBe('critical')
    })

    it('should detect critical priority from "Critical" label (case insensitive)', () => {
      const labels = [createLabel('Critical')]
      expect(detectPriorityFromLabels(labels)).toBe('critical')
    })

    it('should detect critical priority from "urgent" label', () => {
      const labels = [createLabel('urgent')]
      expect(detectPriorityFromLabels(labels)).toBe('critical')
    })

    it('should detect critical priority from "priority: critical" label', () => {
      const labels = [createLabel('priority: critical')]
      expect(detectPriorityFromLabels(labels)).toBe('critical')
    })

    it('should detect critical priority from "urgent-fix" label', () => {
      const labels = [createLabel('urgent-fix')]
      expect(detectPriorityFromLabels(labels)).toBe('critical')
    })
  })

  describe('High Priority', () => {
    it('should detect high priority from "high" label', () => {
      const labels = [createLabel('high')]
      expect(detectPriorityFromLabels(labels)).toBe('high')
    })

    it('should detect high priority from "bug" label', () => {
      const labels = [createLabel('bug')]
      expect(detectPriorityFromLabels(labels)).toBe('high')
    })

    it('should detect high priority from "priority: high" label', () => {
      const labels = [createLabel('priority: high')]
      expect(detectPriorityFromLabels(labels)).toBe('high')
    })

    it('should detect high priority from "high-priority" label', () => {
      const labels = [createLabel('high-priority')]
      expect(detectPriorityFromLabels(labels)).toBe('high')
    })
  })

  describe('Low Priority', () => {
    it('should detect low priority from "low" label', () => {
      const labels = [createLabel('low')]
      expect(detectPriorityFromLabels(labels)).toBe('low')
    })

    it('should detect low priority from "minor" label', () => {
      const labels = [createLabel('minor')]
      expect(detectPriorityFromLabels(labels)).toBe('low')
    })

    it('should detect low priority from "low-priority" label', () => {
      const labels = [createLabel('low-priority')]
      expect(detectPriorityFromLabels(labels)).toBe('low')
    })
  })

  describe('Medium Priority (Default)', () => {
    it('should default to medium priority with no labels', () => {
      const labels: ReturnType<typeof createLabel>[] = []
      expect(detectPriorityFromLabels(labels)).toBe('medium')
    })

    it('should default to medium priority with unrelated labels', () => {
      const labels = [createLabel('enhancement'), createLabel('documentation')]
      expect(detectPriorityFromLabels(labels)).toBe('medium')
    })

    it('should default to medium priority with feature label', () => {
      const labels = [createLabel('feature')]
      expect(detectPriorityFromLabels(labels)).toBe('medium')
    })
  })

  describe('Priority Precedence', () => {
    it('should prioritize critical over high', () => {
      const labels = [createLabel('critical'), createLabel('bug')]
      expect(detectPriorityFromLabels(labels)).toBe('critical')
    })

    it('should prioritize critical over low', () => {
      const labels = [createLabel('urgent'), createLabel('minor')]
      expect(detectPriorityFromLabels(labels)).toBe('critical')
    })

    it('should prioritize high over low', () => {
      const labels = [createLabel('high'), createLabel('low')]
      expect(detectPriorityFromLabels(labels)).toBe('high')
    })

    it('should prioritize high over medium', () => {
      const labels = [createLabel('bug'), createLabel('enhancement')]
      expect(detectPriorityFromLabels(labels)).toBe('high')
    })
  })
})
