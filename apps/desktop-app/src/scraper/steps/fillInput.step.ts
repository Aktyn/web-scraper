//TODO
// import { SiteInstructions, STEP_TYPE } from '@common';

// import { Bot } from '..';

// type Step = SiteInstructions['actions'][number]['steps'][number];

// export async function fillInputStep<ParserData extends object>(
//   this: Bot<ParserData>,
//   step: Step & { type: STEP_TYPE.FILL_INPUT },
//   data: ParserData,
// ) {
//   await this.page.type(step.element, this.parseSpecialCodes(step.value, data) ?? '');
// }
