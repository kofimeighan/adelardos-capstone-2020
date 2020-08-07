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

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalUserServiceTestConfig;
import com.google.sps.servlets.InteractiveChartServlet;
import java.io.*;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

/**
  Tests the Interactive Chart Servlet
*/
@RunWith(JUnit4.class)
public final class InteractiveChartServletTest {
  private final LocalServiceTestHelper helper = new LocalServiceTestHelper(
      new LocalDatastoreServiceTestConfig(), new LocalUserServiceTestConfig());
  private static final String TEST_EMOTION_DATA = "Scared";
  private static final String TEST_TIMESTAMP = "1254792";
  private static final String EMOTION_DATA = "emotion";
  private static final String TIMESTAMP = "timestamp";
  private static final String TABLE_NAME = "Votes";

  @InjectMocks
  private InteractiveChartServlet interactiveChartServlet = new InteractiveChartServlet();

  @Mock private HttpServletRequest request;

  @Mock private HttpServletResponse response;

  /**
    setUp() and tearDown() are method to setup a local appengine service to test things like
    Datastore and UserService. They must be created and disabled before and after tests are run.
  */
  @Before
  public void setUp() throws Exception {
    MockitoAnnotations.initMocks(this);
    helper.setUp();
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  @Test
  public void storesCorrectEntity() throws Exception {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    Entity chartEntity = new Entity(TABLE_NAME);
    chartEntity.setProperty(EMOTION_DATA, TEST_EMOTION_DATA);
    chartEntity.setProperty(TIMESTAMP, TEST_TIMESTAMP);
    datastore.put(chartEntity);

    when(request.getParameter(EMOTION_DATA)).thenReturn(TEST_EMOTION_DATA);
    when(request.getParameter(TIMESTAMP)).thenReturn(TEST_TIMESTAMP);

    interactiveChartServlet.doPost(request, response);

    Query query = new Query(TABLE_NAME);
    PreparedQuery results = datastore.prepare(query);
    List<Entity> singleResult = results.asList(FetchOptions.Builder.withLimit(2));

    assertEquals(TEST_EMOTION_DATA, singleResult.get(0).getProperty(EMOTION_DATA));
    assertEquals(TEST_TIMESTAMP, singleResult.get(0).getProperty(TIMESTAMP));
  }
}
