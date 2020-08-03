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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.ProximityPin;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/proximity-pins")
public class ProximityPinsServlet extends HttpServlet {
  private static final String STREET_ADDRESS = "address";
  private static final String CITY = "city";
  private static final String STATE = "state";
  private static final String ZIPCODE = "zipcode";
  private static final String RACE = "race";
  private static final String CAUSE_OF_DEATH = "cause of death";
  private static final String DATE_OF_DEATH = "date";
  private static final String TABLE_NAME = "Police Violence Data";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String queryState = request.getParameter(STATE);
    Filter stateFilter = new FilterPredicate(STATE, FilterOperator.EQUAL, queryState);
    Query query = new Query(TABLE_NAME).setFilter(stateFilter);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<ProximityPin> queriedPins = new ArrayList<ProximityPin>();
    for (Entity entity : results.asIterable()) {
      String streetAddress = (String) entity.getProperty(STREET_ADDRESS);
      String city = (String) entity.getProperty(CITY);
      String state = (String) entity.getProperty(STATE);
      Double zipcode = (Double) entity.getProperty(ZIPCODE);
      String race = (String) entity.getProperty(RACE);
      String causeOfDeath = (String) entity.getProperty(CAUSE_OF_DEATH);
      String dateOfDeath = (String) entity.getProperty(DATE_OF_DEATH);
      ProximityPin proximityPin =
          new ProximityPin(streetAddress, city, state, zipcode, race, causeOfDeath, dateOfDeath);
      queriedPins.add(proximityPin);
    }

    response.setContentType("application/json");
    response.getWriter().println(new Gson().toJson(queriedPins));
  }
}
