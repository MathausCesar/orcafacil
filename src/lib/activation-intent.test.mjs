import assert from 'node:assert/strict'
import test from 'node:test'

import {
    buildOnboardingIntentPath,
    buildProfileActivationFields,
    getActivationIntentFromPath,
    getActivationIntentFromSearchParams,
    mergeActivationIntents,
    parseActivationIntent,
} from './activation-intent.ts'

const requiredAttribution = {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'mecanicos',
    utm_content: 'hero_primary',
    utm_term: 'orcamento oficina',
    gclid: 'google-click-id',
}

test('preserves every required attribution field from register to onboarding', () => {
    const registerParams = new URLSearchParams({
        ...requiredAttribution,
        plan: 'yearly',
    })
    const registerIntent = getActivationIntentFromSearchParams(registerParams)
    const onboardingPath = buildOnboardingIntentPath('/onboarding', registerIntent)
    const onboardingIntent = getActivationIntentFromPath(onboardingPath)

    assert.deepEqual(onboardingIntent, {
        intendedPlan: 'yearly',
        attribution: requiredAttribution,
    })
})

test('preserves attribution in email metadata and nested OAuth next paths', () => {
    const metadataIntent = parseActivationIntent(JSON.stringify({
        intendedPlan: 'monthly',
        attribution: requiredAttribution,
    }))
    const nextIntent = getActivationIntentFromPath(
        `/onboarding?${new URLSearchParams({ ...requiredAttribution, utm_content: 'google_oauth' })}`,
    )

    assert.deepEqual(mergeActivationIntents(metadataIntent, nextIntent), {
        intendedPlan: 'monthly',
        attribution: {
            ...requiredAttribution,
            utm_content: 'google_oauth',
        },
    })
})

test('does not create empty attribution objects when only a plan exists', () => {
    assert.deepEqual(buildProfileActivationFields({
        intendedPlan: 'monthly',
        attribution: {},
    }, null), {
        intended_plan: 'monthly',
    })
})

test('repairs an empty first touch and preserves an existing non-empty first touch', () => {
    const currentIntent = {
        intendedPlan: null,
        attribution: requiredAttribution,
    }

    assert.deepEqual(buildProfileActivationFields(currentIntent, {}), {
        first_attribution: requiredAttribution,
        last_attribution: requiredAttribution,
    })

    const existingFirst = { utm_source: 'newsletter', utm_medium: 'email' }
    assert.deepEqual(buildProfileActivationFields(currentIntent, existingFirst), {
        last_attribution: requiredAttribution,
    })
})
