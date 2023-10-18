export const termsDetails = [
  {
    title: 'Action',
    content:
      'A named list of action steps that are performed on the site at a given URL.\nAn action step is a basic website operation, such as filling in a text field, pressing a button, reading and returning text from an element, etc.',
  },
  {
    title: 'Flow step',
    content:
      "Part of a procedure that is used for flow control.\nIt calls an action by name and, depending on the result of that action, executes the next step in the procedure's flow.\nFinally, the last step in the flow returns some retrieved data from the page.",
  },
  {
    title: 'Procedure',
    content:
      'A procedure starts at a given URL and executes a flow of actions that leads to the fulfillment of a desired goal, such as finding information about a new promotion at a nearby restaurant.',
  },
  {
    title: 'Site instructions',
    content: 'A set of procedures and actions that are created for a specific site.',
  },
  // TODO: add multi site routine description or remove this comment from code
  // {
  //   title: 'Multi site routine',
  //   content: 'Routine running on multiple sites with sequence of procedures defined by its type',
  // },
  {
    title: 'Routine',
    content:
      'Sequence of procedures to be performed with given data (optional) for a single site.\nData source can be defined in several ways.\nRoutine can be run manually a selected number of times or for each element in the data source.',
  },
  {
    title: 'Chore',
    content:
      'Scheduled routines. Allows you to run a routine repeatedly at any specified time interval.\nThe chore can be repeated indefinitely or until a specified condition is met.',
  },
  {
    title: 'Data source',
    content:
      'Data structure defined by the user to support the execution of site instructions.\nData can be read from and written to the data source.',
  },
] as const
