""" Copyright 2019 Google LLC
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    https://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 

processor.py is used to clean csv's and create data suitable to be
stored within a database."""

import pandas as pd

# TODO(kofimeighan): Create a function that can iterate over all files within 
# the raw_data directory
RAW_TIME_PATH = 'raw_data/police_killings_2013.csv'
CLEAN_TIME_PATH = 'clean_data/time_series.csv'
TIME_COLUMNS = ['date', 'name']


def load_csv_filter_and_frame(file_path, column_names):
  '''
  args: (path to csv files, names of columns to retain)
  rets: pd.Dataframe containing desired columns from csv 
  '''
  tempframe = pd.read_csv(file_path)

  columns_to_keep = []
  for column in tempframe:
    for column_of_interest in column_names:
      if column_of_interest in column.lower():
        columns_to_keep.append(column)
        break

  tempframe = tempframe[columns_to_keep]
  return tempframe


def count_deaths_by_year():
  timeframe = load_csv_filter_and_frame(RAW_TIME_PATH, TIME_COLUMNS)
  timeframe.columns = ['Totals', 'Date']
  timeframe['Date'] = pd.to_datetime(timeframe['Date'], format='%m/%d/%y',
                                     errors='ignore')
  timeframe['Date'] = pd.DatetimeIndex(timeframe['Date']).year
  timeframe = timeframe.groupby(by='Date').count()
  timeframe.to_csv(CLEAN_TIME_PATH)
