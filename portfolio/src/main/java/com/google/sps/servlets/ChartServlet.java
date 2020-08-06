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
import com.google.sps.DataPair;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* Servlet to read chart data from data store and return it in doGet */
// TODO(briafassler): Fix the problem where chart only appears after pressing submit
@WebServlet("/chart-data")
public class ChartServlet extends HttpServlet {
  private static final String TABLE_NAME = "Police Killings By Year";
  private static final String YEAR = "year";
  private static final String AMOUNT_KILLED = "amount killed";
  private static final String test = "{'2020': '5'}";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(TABLE_NAME);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<DataPair> dataPairs = new ArrayList<DataPair>();
    for (Entity entity : results.asIterable()) {
      int amountKilled = (int) entity.getProperty(AMOUNT_KILLED);
      String year = (String) entity.getProperty(YEAR);
      DataPair policeKillings = new DataPair(amountKilled, year);
      dataPairs.add(policeKillings);
    }

    // TODO(briafassler): Use database csv instead of hardcoding data pairs
    dataPairs.add(new DataPair(1106, "2013"));
    dataPairs.add(new DataPair(1050, "2014"));
    dataPairs.add(new DataPair(1103, "2015"));
    dataPairs.add(new DataPair(1071, "2016"));
    dataPairs.add(new DataPair(1093, "2017"));
    dataPairs.add(new DataPair(1142, "2018"));
    dataPairs.add(new DataPair(1099, "2019"));
    dataPairs.add(new DataPair(576, "2020"));

    // Send the JSON as the response
    response.setContentType("application/json");
    response.getWriter().println(new Gson().toJson(dataPairs));
  }
}
