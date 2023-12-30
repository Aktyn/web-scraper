import type {
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
  GLOBAL_ACTION_PREFIX,
  GlobalActionType,
  ProcedureType,
} from '@web-scraper/common'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'

import prisma from '../database/client'

jest.mock('../database/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

export const databaseMock = prisma as unknown as DeepMockProxy<PrismaClient>

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
    {
      id: 2,
      createdAt: new Date('2023-02-20T23:40:10.302Z'),
      url: 'http://localhost:1358/mock-testing',
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
          type: ProcedureType.ACCOUNT_CHECK,
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
      actionName: `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH}`,
      globalReturnValues: null,
      onSuccessFlowStepId: null,
      onFailureFlowStepId: null,
    },
  ] satisfies FlowStep[],
  userData: [
    {
      key: 'tablesCompactMode',
      value: JSON.stringify(true),
    },
    {
      key: 'desktopNotifications',
      value: JSON.stringify(true),
    },
    {
      key: 'backgroundSaturation',
      value: JSON.stringify(0.5),
    },
  ] satisfies UserData[],
}
