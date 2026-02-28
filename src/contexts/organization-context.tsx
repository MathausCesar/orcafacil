"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"

type Organization = Database["public"]["Tables"]["organizations"]["Row"]

interface OrganizationContextType {
    organization: Organization | null
    organizations: Organization[]
    isLoading: boolean
    setOrganization: (org: Organization | null) => void
    refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const refreshOrganizations = async () => {
        setIsLoading(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) {
                setOrganization(null)
                setOrganizations([])
                return
            }

            // Fetch all organizations the user is a member of
            const { data: orgData, error } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error

            if (orgData && orgData.length > 0) {
                setOrganizations(orgData)

                // If no organization is currently selected or the selected one is not in the list anymore
                if (!organization || !orgData.find(o => o.id === organization.id)) {
                    // Check local storage for previously selected org
                    const savedOrgId = localStorage.getItem('activeOrganizationId')
                    const savedOrg = orgData.find(o => o.id === savedOrgId)

                    if (savedOrg) {
                        setOrganization(savedOrg)
                        document.cookie = `active_organization_id=${savedOrg.id}; path=/; max-age=31536000; SameSite=Lax`
                    } else {
                        // Default to the first one (usually the personal workspace created in the migration)
                        setOrganization(orgData[0])
                        localStorage.setItem('activeOrganizationId', orgData[0].id)
                        document.cookie = `active_organization_id=${orgData[0].id}; path=/; max-age=31536000; SameSite=Lax`
                    }
                }
            } else {
                setOrganizations([])
                setOrganization(null)
            }
        } catch (error) {
            console.error("Error loading organizations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Allow manual override and save to local storage
    const handleSetOrganization = (org: Organization | null) => {
        setOrganization(org)
        if (org) {
            localStorage.setItem('activeOrganizationId', org.id)
            document.cookie = `active_organization_id=${org.id}; path=/; max-age=31536000; SameSite=Lax`
        } else {
            localStorage.removeItem('activeOrganizationId')
            document.cookie = 'active_organization_id=; path=/; max-age=0'
        }

        // Since we changed the context and cookies, some server components need to re-render
        // A hard refresh or router.refresh() from the consumer is usually ideal, but for now
        // setting the cookie ensures the next navigation request carries the correct context.
    }

    useEffect(() => {
        refreshOrganizations()

        // Listen to Auth state changes to refresh contexts
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    refreshOrganizations()
                } else if (event === 'SIGNED_OUT') {
                    setOrganization(null)
                    setOrganizations([])
                    localStorage.removeItem('activeOrganizationId')
                    document.cookie = 'active_organization_id=; path=/; max-age=0'
                }
            }
        )

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    return (
        <OrganizationContext.Provider value={{
            organization,
            organizations,
            isLoading,
            setOrganization: handleSetOrganization,
            refreshOrganizations
        }}>
            {children}
        </OrganizationContext.Provider>
    )
}

export function useOrganization() {
    const context = useContext(OrganizationContext)
    if (context === undefined) {
        throw new Error("useOrganization must be used within an OrganizationProvider")
    }
    return context
}
