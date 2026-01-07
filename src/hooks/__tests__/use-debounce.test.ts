import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
        jest.clearAllMocks()
    })

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => {
            return useDebounce('initial', 500)
        })

        expect(result.current).toBe('initial')
    })

    it('should debounce value changes', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 500 }
        })

        expect(result.current).toBe('initial')

        rerender({ value: 'updated', delay: 500 })

        act(() => {
            jest.advanceTimersByTime(500)
        })

        expect(result.current).toBe('updated')
    })

    it('should reset timer on value change', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'a', delay: 500 }
        })

        rerender({ value: 'b', delay: 500 })
        act(() => {
            jest.advanceTimersByTime(300)
        })

        rerender({ value: 'c', delay: 500 })
        act(() => {
            jest.advanceTimersByTime(300)
        })

        expect(result.current).toBe('a')

        act(() => {
            jest.advanceTimersByTime(200)
        })

        expect(result.current).toBe('c')
    })

    it('should use default delay of 500ms', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
            initialProps: { value: 'initial' }
        })

        rerender({ value: 'updated' })

        act(() => {
            jest.advanceTimersByTime(400)
        })
        expect(result.current).toBe('initial')

        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(result.current).toBe('updated')
    })

    it('should work with different data types', () => {
        const numResult = renderHook(({ value }) => useDebounce(value, 100), {
            initialProps: { value: 0 }
        })
        numResult.rerender({ value: 42 })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(numResult.result.current).toBe(42)

        const objResult = renderHook(({ value }) => useDebounce(value, 100), {
            initialProps: { value: { name: 'initial' } }
        })
        objResult.rerender({ value: { name: 'updated' } })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(objResult.result.current).toEqual({ name: 'updated' })

        const arrResult = renderHook(({ value }) => useDebounce(value, 100), {
            initialProps: { value: [1, 2, 3] }
        })
        arrResult.rerender({ value: [4, 5, 6] })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(arrResult.result.current).toEqual([4, 5, 6])
    })

    it('should handle null and undefined', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
            initialProps: { value: 'test' as string | null | undefined }
        })

        rerender({ value: null })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(result.current).toBeNull()

        rerender({ value: undefined })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(result.current).toBeUndefined()
    })

    it('should cleanup timer on unmount', () => {
        const { unmount, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 'initial' }
        })

        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

        rerender({ value: 'updated' })
        unmount()

        expect(clearTimeoutSpy).toHaveBeenCalled()

        clearTimeoutSpy.mockRestore()
    })
})
