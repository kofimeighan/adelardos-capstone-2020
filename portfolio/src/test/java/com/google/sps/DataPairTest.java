// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/**
 * Tests the DataPair class and if its returning fields properly
 */
@RunWith(JUnit4.class)
public final class DataPairTest {
  @Test
  public void correctAmountKilled() {
    DataPair dataPair = new DataPair(1324, 2021);
    Assert.assertEquals(1324, dataPair.getAmountKilled());
  }

  @Test
  public void correctYear() {
    DataPair dataPair = new DataPair(2130, 2025);
    Assert.assertEquals(2025, dataPair.getYear());
  }
}
