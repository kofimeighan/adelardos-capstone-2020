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
import numpy as np

# TODO(kofimeighan): Create a function that can iterate over all files within 
# the raw_data directory
RAW_DATA_FILEPATH = 'raw_data/police_killings_2013.csv'
CLEAN_DATA_FILEPATH = 'clean_data/police_killings_2013.csv'
COLUMNS_OF_INTEREST = ['name', 'race', 'date', 'address', 'city',
                       'state', 'zipcode',]
dataframe = pd.read_csv(RAW_DATA_FILEPATH, index_col=0)
csv_columns = dataframe.columns
columns_to_keep = []

# TODO(kofimeighan): save the zipcode as an int not a long within the database
for csv_column in csv_columns:
    stripped_csv_column = csv_column.lower().replace("'", "")
    for column_of_interest in COLUMNS_OF_INTEREST:
        if column_of_interest.lower() in stripped_csv_column:
            columns_to_keep.append(csv_column)
            break

dataframe = dataframe[columns_to_keep]    
dataframe.to_csv(CLEAN_DATA_FILEPATH, index=False)
