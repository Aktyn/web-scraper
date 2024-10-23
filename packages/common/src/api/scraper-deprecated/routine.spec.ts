import { DataSourceColumnType } from './dataSource'
import { dataSourceFiltersToSqlite } from './routine'

describe(dataSourceFiltersToSqlite.name, () => {
  it('generates sqlite code for where clause based on given array of data source filters', async () => {
    expect(
      dataSourceFiltersToSqlite([
        {
          columnName: 'col1',
          columnType: DataSourceColumnType.TEXT,
          where: "columnName LIKE '%custom condition%'",
        },
        {
          columnName: 'col2',
          columnType: DataSourceColumnType.TEXT,
          where: { equals: 'equality condition' },
        },
        {
          columnName: 'col3',
          columnType: DataSourceColumnType.TEXT,
          where: { notEquals: 'non equality condition' },
        },
        {
          columnName: 'column with spaces',
          columnType: DataSourceColumnType.TEXT,
          where: { in: ['in condition foo1', 'in condition foo2'] },
        },
        {
          columnName: 'col5',
          columnType: DataSourceColumnType.TEXT,
          where: { notIn: ['not in condition foo1', 'not in condition foo2'] },
        },
      ]),
    ).toEqual(
      "columnName LIKE '%custom condition%' AND `col2` = 'equality condition' AND `col3` != 'non equality condition' AND `column with spaces` IN ('in condition foo1', 'in condition foo2') AND `col5` NOT IN ('not in condition foo1', 'not in condition foo2')",
    )

    expect(
      dataSourceFiltersToSqlite([
        {
          columnName: 'col1',
          columnType: DataSourceColumnType.TEXT,
          where: { contains: 'contains condition' },
        },
        {
          columnName: 'col2',
          columnType: DataSourceColumnType.TEXT,
          where: { startsWith: 'starts with condition' },
        },
        {
          columnName: 'col3',
          columnType: DataSourceColumnType.TEXT,
          where: { endsWith: 'ends with condition' },
        },
        {
          columnName: 'col4',
          columnType: DataSourceColumnType.TEXT,
          where: { null: true },
        },
        {
          columnName: 'col5',
          columnType: DataSourceColumnType.TEXT,
          where: { null: false },
        },
      ]),
    ).toEqual(
      "`col1` LIKE '%contains condition%' AND `col2` LIKE 'starts with condition%' AND `col3` LIKE '%ends with condition' AND `col4` IS NULL AND `col5` IS NOT NULL",
    )

    expect(
      dataSourceFiltersToSqlite([
        {
          columnName: 'col1',
          columnType: DataSourceColumnType.INTEGER,
          where: { equals: 1 },
        },
        {
          columnName: 'col2',
          columnType: DataSourceColumnType.INTEGER,
          where: { notEquals: 2 },
        },
        {
          columnName: 'col3',
          columnType: DataSourceColumnType.INTEGER,
          where: { in: [1, 2, 3] },
        },
        {
          columnName: 'col4',
          columnType: DataSourceColumnType.REAL,
          where: { notIn: [1.4, 3.14] },
        },
        {
          columnName: 'col5',
          columnType: DataSourceColumnType.INTEGER,
          where: { lt: 1 },
        },
        {
          columnName: 'col6',
          columnType: DataSourceColumnType.INTEGER,
          where: { lte: 2 },
        },
        {
          columnName: 'col7',
          columnType: DataSourceColumnType.INTEGER,
          where: { gt: 3 },
        },
        {
          columnName: 'col8',
          columnType: DataSourceColumnType.INTEGER,
          where: { gte: 4 },
        },
        {
          columnName: 'col9',
          columnType: DataSourceColumnType.REAL,
          where: { null: false },
        },
      ]),
    ).toEqual(
      '`col1` = 1 AND `col2` != 2 AND `col3` IN (1, 2, 3) AND `col4` NOT IN (1.4, 3.14) AND `col5` < 1 AND `col6` <= 2 AND `col7` > 3 AND `col8` >= 4 AND `col9` IS NOT NULL',
    )
  })

  it('generates sqlite code for where clause based on given array of nested data source filters', async () => {
    expect(
      dataSourceFiltersToSqlite([
        {
          columnName: 'col1',
          columnType: DataSourceColumnType.INTEGER,
          where: { gt: 3 },
        },
        {
          columnName: 'foo',
          columnType: DataSourceColumnType.REAL,
          where: {
            AND: [
              {
                columnName: 'col3',
                columnType: DataSourceColumnType.TEXT,
                where: { startsWith: 'nested and condition 1' },
              },
              {
                columnName: 'col4',
                columnType: DataSourceColumnType.TEXT,
                where: { notEquals: 'nested and condition 2' },
              },
              {
                columnName: 'bar',
                columnType: DataSourceColumnType.REAL,
                where: {
                  OR: [
                    {
                      columnName: 'col5',
                      columnType: DataSourceColumnType.TEXT,
                      where: { endsWith: 'nested or condition' },
                    },
                    {
                      columnName: 'col6',
                      columnType: DataSourceColumnType.INTEGER,
                      where: { equals: 5 },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]),
    ).toEqual(
      "`col1` > 3 AND (`col3` LIKE 'nested and condition 1%' AND `col4` != 'nested and condition 2' AND (`col5` LIKE '%nested or condition' OR `col6` = 5))",
    )
  })
})
