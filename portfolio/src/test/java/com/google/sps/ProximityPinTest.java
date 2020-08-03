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
 * Tests the ProximityPin class
 */
@RunWith(JUnit4.class)
public final class ProximityPinTest {
  @Test
  public void correctDescription() {
    ProximityPin proximityPin = new ProximityPin(
        "1600 Ampitheatre Pkwy", "Mountain View", "CA", 94043.0 , "black", "Gunshot", "7/29/20");

    Assert.assertEquals("1600 Ampitheatre Pkwy Mountain View CA 94043.0", proximityPin.getAddress());
  }

  @Test
  public void correctDate() {
    ProximityPin proximityPin = new ProximityPin(
        "1600 Ampitheatre Pkwy", "Mountain View", "CA", 94043.0 , "black", "Gunshot", "7/29/20");

    Assert.assertEquals("7/29/20", proximityPin.getDate());
  }
}
