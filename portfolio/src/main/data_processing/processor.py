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

from google.cloud import datastore
import pandas as pd
import numpy as np
import os

def cleanData(raw_file, COLUMNS_OF_INTEREST):
  raw_file_path = 'raw_data/' + raw_file
  dataframe = pd.read_csv(raw_file_path, index_col=0)
  csv_columns = dataframe.columns
  columns_to_keep = []
  for csv_column in csv_columns:
    stripped_csv_column = csv_column.lower()
    for column_of_interest in COLUMNS_OF_INTEREST:
        if column_of_interest.lower() in stripped_csv_column:
          columns_to_keep.append(csv_column)
          break
      
  dataframe = dataframe[columns_to_keep]
  clean_file_path = 'clean_data/' + raw_file
  dataframe.to_csv(clean_file_path, index = False)
  return columns_to_keep

def storeToDatabase(clean_file, columns_to_keep, kind):
  RACE_CATAGORIES = ['American Indian', 'Alaska Native', 'Asian', 'Black',
                     'African American', 'Native Hawaiian', 
                     'Pacific Islander', 'White', 'Hispanic', 'Latino',]
  RACE = 'race'
  clean_file_path = 'clean_data/' + clean_file
  dataframe = pd.read_csv(clean_file_path)
  datastore_client = datastore.Client()

  for row in range(len(dataframe)):
    has_race_gender_year_location = True
    violence_entity = datastore.Entity(key=datastore_client.key(kind))
    column_number = 0
    for column in columns_to_keep:
      if 'race' not in column:
        violence_entity.update({column : 
                              dataframe.iloc[row, column_number]})
        column_number += 1
      elif 'race' in column and dataframe.iloc[row, column_number] \
                  in RACE_CATAGORIES:
        violence_entity.update({column : 
                                dataframe.iloc[row, column_number]})
        column_number += 1
      else:
        has_race_gender_year_location = False
      if has_race_gender_year_location:
        datastore_client.put(violence_entity)

# TODO(kofimeighan): iterate along files within the raw_data directory
def main():
  file = 'police_killings_2013.csv'
  KIND = 'Police Violence Data'
  COLUMNS_OF_INTEREST = ['name', 'race', 'date', 'address', 'city',
                         'state', 'zipcode', 'police budget', 'hospital',
                         'education', 'cause of death', 'budget',]
    
  columns_to_keep = cleanData(file, COLUMNS_OF_INTEREST)
  storeToDatabase(file, columns_to_keep, KIND)

if __name__ == '__main__':
  main()
