/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useQuery } from "@apollo/client";
import React, { useMemo } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Select, { OptionsType, OptionTypeBase } from "react-select";
import { optionIndexKeys } from "src/components/PageHome/filterExperiments";
import {
  FilterOptions,
  FilterValue,
  FilterValueKeys,
  NonNullFilterOption,
  NonNullFilterOptions,
} from "src/components/PageHome/types";
import { displayConfigLabelOrNotSet } from "src/components/Summary";
import { GET_EXPERIMENTS_QUERY } from "src/gql/experiments";
import { useConfig } from "src/hooks";
import { getAllExperiments_experiments } from "src/types/getAllExperiments";

export type FilterBarProps = {
  options: FilterOptions;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  value: filterValue,
  onChange,
}) => {
  return (
    <Navbar
      variant="light"
      bg="light"
      className="nav-fill mb-4"
      style={{ padding: "0" }}
    >
      <Nav className="w-100 flex-column">
        <FilterSelect
          fieldLabel="Feature"
          fieldOptions={options.allFeatureConfigs!}
          filterValueName="allFeatureConfigs"
          optionLabelName="name"
          {...{ filterValue, onChange }}
        />
        <FilterSelect
          fieldLabel="Application"
          fieldOptions={options.applications!}
          filterValueName="applications"
          optionLabelName="label"
          {...{ filterValue, onChange }}
        />
        <FilterSelect
          fieldLabel="Owner"
          fieldOptions={options.owners!}
          filterValueName="owners"
          optionLabelName="username"
          {...{ filterValue, onChange }}
        />
        <FilterSelect
          fieldLabel="Version"
          fieldOptions={options.firefoxVersions!}
          filterValueName="firefoxVersions"
          optionLabelName="label"
          {...{ filterValue, onChange }}
        />
        <FilterSelect
          fieldLabel="Channel"
          fieldOptions={options.channels!}
          filterValueName="channels"
          optionLabelName="label"
          {...{ filterValue, onChange }}
        />
        <FilterSelect
          fieldLabel="Type"
          fieldOptions={options.types!}
          filterValueName="types"
          optionLabelName="label"
          {...{ filterValue, onChange }}
        />
        <FilterSelect
          fieldLabel="Team Project"
          fieldOptions={options.projects!}
          filterValueName="projects"
          optionLabelName="name"
          {...{ filterValue, onChange }}
        />
        <FilterSelect
          fieldLabel="Audience"
          fieldOptions={options.targetingConfigs!}
          filterValueName="targetingConfigs"
          optionLabelName="label"
          {...{ filterValue, onChange }}
        />
      </Nav>
    </Navbar>
  );
};

type FilterSelectProps<
  K extends FilterValueKeys,
  T extends NonNullFilterOptions<K>,
> = {
  filterValue: FilterValue;
  onChange: (value: FilterValue) => void;
  filterValueName: K;
  fieldLabel: string;
  fieldOptions: T;
  optionLabelName: keyof NonNullFilterOption<K>;
};

const FilterSelect = <
  K extends FilterValueKeys,
  T extends NonNullFilterOptions<K>,
>({
  filterValue,
  onChange,
  filterValueName,
  fieldLabel,
  fieldOptions,
  optionLabelName,
}: FilterSelectProps<K, T>) => {
  const filterOptions = useMemo(
    () =>
      (fieldOptions! as NonNullFilterOptions<K>).filter(
        (option): option is NonNullable<typeof option> => !!option,
      ),
    [fieldOptions],
  );

  const fieldValue = filterValue[filterValueName];
  const { applications } = useConfig();
  const { loading } = useQuery<{
    experiments: getAllExperiments_experiments[];
  }>(GET_EXPERIMENTS_QUERY, { fetchPolicy: "network-only" });
  return (
    <Nav.Item className="mb-2 text-left flex-basis-0 flex-grow-1 flex-shrink-1 w-100">
      <Select
        {...{
          name: `filter-${filterValueName}`,
          inputId: `filter-${filterValueName}`,
          isMulti: true,
          value: fieldValue,
          isDisabled: loading,
          placeholder: "All " + fieldLabel + "s",
          getOptionLabel: (item: OptionTypeBase) =>
            fieldLabel === "Feature"
              ? item[optionLabelName as string] +
                ` (${displayConfigLabelOrNotSet(
                  item["application"],
                  applications,
                )})`
              : item[optionLabelName as string],
          getOptionValue: (item: OptionTypeBase) =>
            optionIndexKeys[filterValueName](
              // @ts-ignore because this works in practice but types disagree
              item as NonNullFilterOption<K>,
            )!,
          options: filterOptions,
          onChange: (fieldValue: OptionsType<OptionTypeBase>) => {
            onChange({
              ...filterValue,
              [filterValueName]: fieldValue,
            });
          },
        }}
      />
    </Nav.Item>
  );
};

export default FilterBar;
