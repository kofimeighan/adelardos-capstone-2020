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
import sys

COLUMNS_OF_INTEREST = ['name', 'race', 'date', 'address', 'city',
                       'state', 'zipcode', 'police budget', 'hospital',
                       'education', 'cause of death', 'budget',]
RACE_CATEGORIES = ['American Indian', 'Alaska Native', 'Asian', 'Black',
                   'African American', 'Native Hawaiian', 'Native American',
                   'Pacific Islander', 'White', 'Hispanic', 'Latino',]
RACE = 'race'

def clean_data(raw_file):
  raw_file_path = 'raw_data/' + raw_file
  dataframe = pd.read_csv(raw_file_path, index_col=0)
  csv_columns = dataframe.columns
  columns_to_keep = []
  for csv_column in csv_columns:
    stripped_csv_column = csv_column.lower()
    for column_of_interest in COLUMNS_OF_INTEREST:
        if column_of_interest.lower() in stripped_csv_column:
          dataframe = dataframe.rename(columns={csv_column:column_of_interest})
          columns_to_keep.append(column_of_interest)
          break
      
  dataframe = dataframe[columns_to_keep]
  clean_file_path = 'clean_data/' + raw_file
  dataframe.to_csv(clean_file_path, index = False)
  return columns_to_keep

def store_to_database(clean_file, kind):
  clean_file_path = 'clean_data/' + clean_file
  dataframe = pd.read_csv(clean_file_path)
  datastore_client = datastore.Client()

  for row in dataframe.itertuples():
    if row.race not in RACE_CATEGORIES:
      continue
    violence_entity = datastore.Entity(key=datastore_client.key(kind))
    
    for index, column in enumerate(dataframe.columns):
      violence_entity[column] = row[index+1]

    datastore_client.put(violence_entity)    

def main(file, kind): 
  clean_data(file)
  store_to_database(file, kind)

# To clean and store specific CSV data, you have to enter
# enter the file name and the kind of entity you'd like to store.
if __name__ == '__main__':
  main(sys.argv[1], sys.argv[2])
