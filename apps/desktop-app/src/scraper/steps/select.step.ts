//TODO
// import { SiteInstructions, STEP_TYPE } from '@common';

// import { Bot } from '..';

// type Step = SiteInstructions['actions'][number]['steps'][number];

// //TODO: make it generic or move to @common
// enum SearchedCategoryType {
//   WINDOWS = 'windows',
// }

// export async function selectStep<ParserData extends object>(
//   this: Bot<ParserData>,
//   step: Step & { type: STEP_TYPE.SELECT_OPTION },
//   data: ParserData,
// ) {
//   const searchedCategory = this.parseSpecialCodes(step.value, data);
//   if (!searchedCategory) {
//     return;
//   }
//   const selectedValue = await this.page.evaluate(
//     ([searchedCategory, element]) => {
//       const optionArray: HTMLOptionElement[] = Array.from(document.querySelectorAll(`${element} option`));
//       for (const element of optionArray) {
//         switch (searchedCategory) {
//           case SearchedCategoryType.WINDOWS:
//             if (element.textContent.toLowerCase() === 'programy' || element.textContent.toLowerCase() === 'windows')
//               return element.value;
//             break;
//           default:
//             break;
//         }
//       }
//       return undefined;
//     },
//     [searchedCategory, step.element],
//   );
//   await this.page.select(step.element, selectedValue);
// }
