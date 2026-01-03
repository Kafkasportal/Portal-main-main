import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change the value
    rerender({ value: 'updated', delay: 500 })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast forward timer
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now the value should be updated
    expect(result.current).toBe('updated')
  })

  it('should reset timer on value change', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    )

    // Change value before timer completes
    rerender({ value: 'b', delay: 500 })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Change again
    rerender({ value: 'c', delay: 500 })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Still the initial value
    expect(result.current).toBe('a')

    // Wait for full delay after last change
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Now it should be the latest value
    expect(result.current).toBe('c')
  })

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'updated' })

    // Should not change at 400ms
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toBe('initial')

    // Should change at 500ms
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('updated')
  })

  it('should work with different data types', () => {
    // Number
    const { result: numResult, rerender: numRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    )

    numRerender({ value: 42 })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(numResult.current).toBe(42)

    // Object
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { name: 'initial' } } }
    )

    objRerender({ value: { name: 'updated' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(objResult.current).toEqual({ name: 'updated' })

    // Array
    const { result: arrResult, rerender: arrRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: [1, 2, 3] } }
    )

    arrRerender({ value: [4, 5, 6] })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(arrResult.current).toEqual([4, 5, 6])
  })

  it('should work with null and undefined', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'test' as string | null | undefined } }
    )

    rerender({ value: null })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBeNull()

    rerender({ value: undefined })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBeUndefined()
  })

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'updated', delay: 100 })

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('updated')
  })

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    unmount()

    // clearTimeout should have been called
    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
  })
})
