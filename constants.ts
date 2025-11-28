import { AwsExam } from './types';

export const AWS_EXAMS: AwsExam[] = [
  {
    code: 'CLF-C02',
    name: 'Cloud Practitioner',
    level: 'Foundational',
    description: 'Overall understanding of the AWS Cloud platform.',
    color: 'bg-gray-600'
  },
  {
    code: 'SAA-C03',
    name: 'Solutions Architect - Associate',
    level: 'Associate',
    description: 'Designing distributed systems on AWS.',
    color: 'bg-blue-600'
  },
  {
    code: 'DVA-C02',
    name: 'Developer - Associate',
    level: 'Associate',
    description: 'Developing and maintaining applications on AWS.',
    color: 'bg-cyan-600'
  },
  {
    code: 'SOA-C02',
    name: 'SysOps Administrator - Associate',
    level: 'Associate',
    description: 'Deployment, management, and operations on AWS.',
    color: 'bg-teal-600'
  },
  {
    code: 'SAP-C02',
    name: 'Solutions Architect - Professional',
    level: 'Professional',
    description: 'Designing complex and scalable systems.',
    color: 'bg-indigo-600'
  },
  {
    code: 'DOP-C02',
    name: 'DevOps Engineer - Professional',
    level: 'Professional',
    description: 'Provisioning, operating, and managing distributed application systems.',
    color: 'bg-violet-600'
  },
];