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

public final class UserComment {
  private final String name;
  private final String phone;
  private final String location;
  private final String description;
  private final long timeStamp;
  private final long id;

  public UserComment(
      String name, String phone, String location, String description, long timeStamp, long id) {
    this.name = name;
    this.phone = phone;
    this.location = location;
    this.description = description;
    this.timeStamp = timeStamp;
    this.id = id;
  }
}