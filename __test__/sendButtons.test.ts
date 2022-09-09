import { stepNames, WithValueNFocus, ISendCheckboxes, StepNames, StepName } from '../types'

import { getArrIdx, getOrderStatus, getNextStepName, getPrevStepName, getMaxPromotion, getPassedTo } from '../utilities'

import { describe, expect, test } from '@jest/globals'

describe('getArrIdx', () => {
    test('should return getArrIdx', () => {
        const arrIdx = getArrIdx('offerStep', stepNames)
        expect(arrIdx).toBe(2)
    })
})

describe('getOrderStatus', () => {
    test('should return isCurent', () => {
        const arr = getOrderStatus({
            curStepName: 'offerStep',
            passedTo: 'offerStep',
            maxPromotion: 'offerStep',
        })
        expect(arr).toEqual({
            isCurrent: true,
            isEdit: false,
            isProceedToNext: false,
            isProceedToEdit: false,
        })
    })
    test('should return isEdit', () => {
        const arr = getOrderStatus({
            curStepName: 'offerStep',
            passedTo: 'offerStep',
            maxPromotion: 'formStep',
        })
        expect(arr).toEqual({
            isCurrent: false,
            isEdit: true,
            isProceedToNext: false,
            isProceedToEdit: false,
        })
    })
    test('should return isProceedToNext', () => {
        const arr = getOrderStatus({
            curStepName: 'offerStep',
            passedTo: 'contractStep',
            maxPromotion: 'offerStep',
        })
        expect(arr).toEqual({
            isCurrent: false,
            isEdit: false,
            isProceedToNext: true,
            isProceedToEdit: false,
        })
    })
    test('should return isProceedToEdit', () => {
        const arr = getOrderStatus({
            curStepName: 'offerStep',
            passedTo: 'beffaringStep',
            maxPromotion: 'offerStep',
        })
        expect(arr).toEqual({
            isCurrent: false,
            isEdit: false,
            isProceedToNext: false,
            isProceedToEdit: true,
        })
    })
})

describe('getNextStepName', () => {
    test('should return nextStepName', () => {
        const nextStepName = getNextStepName('offerStep')
        expect(nextStepName).toBe('contractStep')
    })
})

describe('getPrevStepName', () => {
    test('should return prevStepName', () => {
        const prevStepName = getPrevStepName('offerStep')
        expect(prevStepName).toBe('beffaringStep')
    })
})

describe('getMaxPromotion', () => {
    test('should return new maxPromotion', () => {
        const maxPromotion = getMaxPromotion('contractCheckerStep', 'contractStep')
        expect(maxPromotion).toBe('contractCheckerStep')
    })
    test('should return old maxPromotion', () => {
        const maxPromotion = getMaxPromotion('formStep', 'contractCheckerStep')
        expect(maxPromotion).toBe('contractCheckerStep')
    })
})

describe('getPassedTo', () => {
    test('should return nextToPass', () => {
        const passedTo: StepName = 'contractStep'
        const curStepName: StepName = 'contractStep'
        const maxPromotion: StepName = 'contractStep'
        const { isCurrent, isEdit } = getOrderStatus({ passedTo, curStepName, maxPromotion })
        expect(isCurrent).toBe(true)
        const _passedTo = getPassedTo({
            curStepName,
            isCurrentOrEdit: isCurrent || isEdit,
            isMainCondition: true,
            passedTo,
            target: {
                prevCheckbox: { checked: false },
                nextCheckbox: { checked: true },
            } as EventTarget & WithValueNFocus<ISendCheckboxes>,
            nextToPass: 'contractStep',
        })
        expect(_passedTo).toBe('contractStep')
    })
    test('should return currentStep', () => {
        const passedTo: StepName = 'contractCreatorStep'
        const curStepName: StepName = 'contractStep'
        const maxPromotion: StepName = 'workStep'
        const { isCurrent, isEdit } = getOrderStatus({ passedTo, curStepName, maxPromotion })
        expect(isCurrent).toBe(false)
        const _passedTo = getPassedTo({
            curStepName,
            isCurrentOrEdit: isCurrent || isEdit,
            isMainCondition: true,
            passedTo,
            target: {
                prevCheckbox: { checked: false },
                nextCheckbox: { checked: false },
            } as EventTarget & WithValueNFocus<ISendCheckboxes>,
        })
        expect(_passedTo).toBe('contractCreatorStep')
    })
})
