import * as React from 'react'
import { ZaclyEmailTemplate } from './zacly-email-template'

interface BasicEmailTemplateProps {
    firstName: string
    message: string
}

export const BasicEmailTemplate: React.FC<Readonly<BasicEmailTemplateProps>> = ({
    firstName,
    message,
}) => (
    <ZaclyEmailTemplate
        title="Tem uma novidade para voce"
        greeting={`Ola, ${firstName}!`}
        message={message}
    />
)
