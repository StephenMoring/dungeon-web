import { describe, expect, it } from 'vitest'
import { TURN_ACTIONS, replyFor } from './turn-script'

describe('turn script', () => {
  it('offers four actions, the first being the prefilled one', () => {
    expect(TURN_ACTIONS).toHaveLength(4)
    expect(TURN_ACTIONS[0].action).toBe('I step through the iron doors')
  })

  it('answers each written action with a roll and a closing question', () => {
    for (const { action } of TURN_ACTIONS) {
      const reply = replyFor(action)
      expect(reply).not.toBeNull()
      expect(reply!.roll.value).toBeGreaterThanOrEqual(1)
      expect(reply!.roll.value).toBeLessThanOrEqual(10)
      expect(reply!.after.trim().endsWith('?')).toBe(true)
    }
  })

  it('matches regardless of case and surrounding space', () => {
    expect(replyFor('  i light a torch and wait ')).toEqual(replyFor('I light a torch and wait'))
  })

  it('has no written answer for anything else', () => {
    expect(replyFor('I sing to the ghost')).toBeNull()
    expect(replyFor('')).toBeNull()
  })
})
