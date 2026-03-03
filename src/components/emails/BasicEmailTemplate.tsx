import * as React from 'react';

interface BasicEmailTemplateProps {
    firstName: string;
    message: string;
}

export const BasicEmailTemplate: React.FC<Readonly<BasicEmailTemplateProps>> = ({
    firstName,
    message,
}) => (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
        <h1 style={{ color: '#0056b3' }}>Olá, {firstName}!</h1>
        <p>{message}</p>
        <br />
        <p>Atenciosamente,</p>
        <strong>Equipe Zacly</strong>
    </div>
);
