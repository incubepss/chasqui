/**
 * Utilidad stateless para crear estructura de seleccion de items agrupados por una key
 *
 *
 */

export type ParamType = number | string;

export type GroupParam = Record<ParamType, ParamType[]>;

export const newGroupParam = (): GroupParam => {
  return {};
};

const CHAR_KEY_GROUP = ':';
const CHAR_SPLIT_GROUPS = '+';
const CHAR_SPLIT_VALUES = ',';

export const toggleValue = (group: GroupParam, keyGroup: ParamType, value: ParamType): GroupParam => {
  if (!group) {
    group = newGroupParam();
  }

  if (!group[keyGroup]) {
    group[keyGroup] = [];
  }

  if (isActive(group, keyGroup, value)) {
    group[keyGroup] = group[keyGroup].filter(x => x !== value);
  } else {
    group[keyGroup].push(value);
  }

  return group;
};

/**
 *
 * @param group
 * @returns  string como 1:A,B+2:C,D
 */
export const serialize = (group: GroupParam): string => {
  if (!group) {
    return '';
  }
  const ret: string[] = [];
  const keyValues = Object.keys(group);
  keyValues.forEach(key => {
    const values = group[key];
    if (!values.length) {
      return;
    }
    const param = key + CHAR_KEY_GROUP + values.join(CHAR_SPLIT_VALUES);
    ret.push(param);
  });

  return ret.join(CHAR_SPLIT_GROUPS);
};

/**
 *
 * @param value string como  1:A,B+2:C,D
 * @returns
 */
export const deserialize = (value: string | null): GroupParam => {
  const group = newGroupParam();
  if (!value) {
    return group;
  }
  const params = value.split(CHAR_SPLIT_GROUPS);

  params.forEach(param => {
    const parts = param.split(CHAR_KEY_GROUP);
    if (parts.length !== 2) {
      return;
    }

    const key = parts[0];
    const values = parts[1].split(CHAR_SPLIT_VALUES);
    group[key] = values;
  });

  return group;
};

export const isActive = (group: GroupParam, keyGroup: ParamType, value: ParamType): boolean => {
  return group?.[keyGroup]?.includes(value) || false;
};

export const isEmpty = (group: GroupParam): boolean => {
  return !group || !Object.keys(group).length;
};

export default {
  newGroupParam,
  toggleValue,
  serialize,
  deserialize,
  isActive,
  isEmpty,
};
