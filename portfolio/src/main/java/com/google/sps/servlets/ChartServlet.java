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
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.Long;
import java.lang.Math;
import java.util.*;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* Servlet to read chart data from data store and return it in doGet */
@WebServlet("/chart-data")
public class ChartServlet extends HttpServlet {
  private static final String TABLE_NAME = "Police Killings By Year";
  private static final String DATE = "Date";
  private static final String TOTALS = "Totals";
  private static final String YEAR_ORDER = "Years";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(TABLE_NAME).addSort(DATE, SortDirection.ASCENDING);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<DataPair> dataPairs = new ArrayList<DataPair>();
    for (Entity entity : results.asIterable()) {
      int amountKilled = ((Long) entity.getProperty(TOTALS)).intValue();
      int year = ((Long) entity.getProperty(DATE)).intValue();
      DataPair policeKillings = new DataPair(amountKilled, year);
      dataPairs.add(policeKillings);
    }

    // Send the JSON as the response
    response.setContentType("application/json");
    response.getWriter().println(new Gson().toJson(dataPairs));
  }
}