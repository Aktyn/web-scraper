import type {
  Account,
  Action,
  ActionStep,
  FlowStep,
  PrismaClient,
  Procedure,
  Site,
  SiteInstructions,
  SiteTag,
  SiteTagsRelation,
  UserData,
} from '@prisma/client'
import {
  ActionStepErrorType,
  ActionStepType,
  GlobalActionType,
  ProcedureType,
} from '@web-scraper/common'
import { vi } from 'vitest'
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import prisma from '../database/client'
import { encrypt } from '../utils'

vi.mock('../database/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

export const databaseMock = prisma as unknown as DeepMockProxy<PrismaClient>

const mockPassword = 'mock-password'

export const mockData = {
  siteTags: [
    {
      id: 1,
      name: 'Mock-1',
      description: 'Mocked site 1',
    },
    {
      id: 2,
      name: 'Mock-2',
      description: 'Mocked site 1',
    },
  ] satisfies SiteTag[],
  siteTagsRelations: [
    {
      tagId: 1,
      siteId: 1,
    },
    {
      tagId: 2,
      siteId: 1,
    },
  ] satisfies SiteTagsRelation[],
  sites: [
    {
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      url: 'https://mocked-site.com',
      language: 'en',
    },
  ] satisfies Site[],
  siteInstructions: [
    {
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      siteId: 1,
      Actions: [
        {
          id: 1,
          name: 'login',
          url: null,
          siteInstructionsId: 1,
          ActionSteps: [
            {
              id: 1,
              type: ActionStepType.FILL_INPUT,
              data: JSON.stringify({ element: 'body > input[type=text]' }),
              orderIndex: 1,
              actionId: 1,
            },
            {
              id: 2,
              type: ActionStepType.PRESS_BUTTON,
              data: JSON.stringify({ element: 'body > button', waitForNavigation: false }),
              orderIndex: 2,
              actionId: 1,
            },
            {
              id: 3,
              type: ActionStepType.CHECK_SUCCESS,
              data: JSON.stringify({
                element: 'body > div',
                mapSuccess: [{ content: 'success', error: ActionStepErrorType.NO_ERROR }],
              }),
              orderIndex: 3,
              actionId: 1,
            },
          ],
        },
      ],
      Procedures: [
        {
          id: 1,
          type: ProcedureType.LOGIN,
          startUrl: `{{URL.ORIGIN}}/login`,
          waitFor: 'body > h1',
          siteInstructionsId: 1,
          flowStepId: 1,
          FlowStep: {
            id: 1,
            actionName: 'action.name',
            globalReturnValues: null,
            onSuccessFlowStepId: 2,
            onFailureFlowStepId: null,
          },
        },
      ],
    },
  ] satisfies (SiteInstructions & {
    Actions: (Action & { ActionSteps: ActionStep[] })[]
    Procedures: (Procedure & { FlowStep: FlowStep | null })[]
  })[],
  flowSteps: [
    {
      id: 2,
      actionName: `global.${GlobalActionType.FINISH}`,
      globalReturnValues: null,
      onSuccessFlowStepId: null,
      onFailureFlowStepId: null,
    },
  ] satisfies FlowStep[],
  accounts: [
    {
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      loginOrEmail: encrypt('Mock-username-1', mockPassword, 'buffer'),
      password: encrypt('Mock-password-1', mockPassword, 'buffer'),
      additionalCredentialsData: null,
      lastUsed: new Date('2023-02-19T23:40:10.302Z'),
      active: true,
      siteId: 1,
    },
    {
      id: 2,
      createdAt: new Date('2023-02-22T23:40:10.302Z'),
      loginOrEmail: encrypt('Mock-username-2', mockPassword, 'buffer'),
      password: encrypt('Mock-password-2', mockPassword, 'buffer'),
      additionalCredentialsData: encrypt('{"value": "mock-data"}', mockPassword, 'buffer'),
      lastUsed: new Date('2023-02-22T23:40:10.302Z'),
      active: true,
      siteId: 1,
    },
  ] satisfies Account[],
  userData: [
    {
      key: 'tablesCompactMode',
      value: JSON.stringify(true),
    },
  ] satisfies UserData[],
}
