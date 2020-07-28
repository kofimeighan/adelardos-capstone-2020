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

package com.google.sps.servlets;

import java.util.StringJoiner;

public final class ProximityPin {
  private final String address;
  private final String race;
  private final String causeOfDeath;
  private final String dateOfDeath;

  public ProximityPin(String streetAddress, String city, String state, String zipcode, String race,
      String causeOfDeath, String dateOfDeath) {
    this.address =
        new StringJoiner(" ").add(streetAddress).add(city).add(state).add(zipcode).toString();
    this.race = race;
    this.causeOfDeath = causeOfDeath;
    this.dateOfDeath = dateOfDeath;
  }
}
